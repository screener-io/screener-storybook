/* eslint-disable */

var getStorybook = require('@kadira/storybook').getStorybook;
var path = require('path');
var EventEmitter = require('events');
var loadBabelConfig = require('@kadira/storybook/dist/server/babel_config').default;
var runWithRequireContext = require('./require_context');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = function(options, callback) {
  var babel = require('babel-core');
  var configDir = './.storybook';
  var polyfillsPath = require.resolve('./default_config/polyfills.js');
  var loadersPath = require.resolve('./default_config/loaders.js');
  var configPath = path.resolve(configDir, 'config.js');
  var babelConfig = loadBabelConfig(configDir);

  // cacheDir is webpack babel loader specific. We don't run webpack.
  delete babelConfig.cacheDirectory;

  require('babel-register')(babelConfig);
  require('babel-polyfill');

  // load loaders
  var loaders = require(path.resolve(loadersPath));

  Object.keys(loaders).forEach(function(ext) {
    var loader = loaders[ext];
    require.extensions['.' + ext] = function(m, filepath) {
      m.exports = loader(filepath);
    };
  });

  // load polyfills
  require(path.resolve(polyfillsPath));

  // set userAgent so storybook knows we're storyshots
  if (!global.navigator) {
    global.navigator = {};
  }
  global.navigator.userAgent = 'screener';

  // Channel for addons is created by storybook manager from the client side.
  // We need to polyfill it for the server side.
  var addons = require('@kadira/storybook-addons').default;
  var channel = new EventEmitter();
  addons.setChannel(channel);

  var content = babel.transformFileSync(configPath, babelConfig).code;
  var contextOpts = {
    filename: configPath,
    dirname: path.resolve(configDir),
  };
  try {
    runWithRequireContext(content, contextOpts);
    var storybook = require('@kadira/storybook').getStorybook();
    callback(null, storybook);
  } catch(ex) {
    if (!options || !options.staticPath) return callback(ex);
    // Exception may be caused by global dependencies injected into browser's Window object.
    // We are not running through an actual browser, so try JSDom.
    var jsdom = require('jsdom');
    var fs = require('fs');
    var dirPath = path.resolve(options.staticPath, 'static');
    var previewPath = null;
    if (fs.existsSync(dirPath)) {
      var files = fs.readdirSync(dirPath);
      files.forEach(function(filename) {
        if (/^preview\.[^\.]+\.bundle\.js$/.test(filename)) {
          previewPath = path.resolve(dirPath, filename);
        }
      });
    }
    if (!previewPath) return callback(ex);
    console.log(ex.message);
    console.log('Retrying with static build...');
    // attempt to parse js file and retrieve window object
    jsdom.env({
      html: '',
      src: [fs.readFileSync(previewPath, 'utf-8')],
      done: function (err, window) {
        if (err) return callback(err);
        global.window = window || {};
        Object.keys(global.window).forEach(function(property) {
          if (typeof global[property] === 'undefined') {
            global[property] = window[property];
          }
        });
        // retry
        try {
          runWithRequireContext(content, contextOpts);
          var storybook = require('@kadira/storybook').getStorybook();
          callback(null, storybook);
        } catch(ex) {
          callback(ex);
        }
      }
    });
  }
};
