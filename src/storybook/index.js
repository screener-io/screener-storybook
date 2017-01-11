/* eslint-disable */

var getStorybook = require('@kadira/storybook').getStorybook;
var path = require('path');
var EventEmitter = require('events');
var loadBabelConfig = require('@kadira/storybook/dist/server/babel_config').default;
var runWithRequireContext = require('./require_context');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

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
runWithRequireContext(content, contextOpts);
var storybook = require('@kadira/storybook').getStorybook();

module.exports = storybook;
