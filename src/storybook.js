var storybookCheck = require('./check');
var path = require('path');
var fs = require('fs');
var getPort = require('get-port');
var spawn = require('child_process').spawn;
var request = require('request');
var jsdom = require('jsdom');
var colors = require('colors/safe');
var template = require('lodash/template');

var previewCode;

exports.server = function(config, options, callback) {
  var storybookApp;
  var storybookVersion;
  if (!config || !config.storybookConfigDir) {
    return callback(new Error('Error: \'storybookConfigDir\' not found in config file.'));
  }
  if ([2, 3].indexOf(config.storybookVersion) > -1) {
    storybookApp = 'react';
    if (['react', 'vue'].indexOf(config.storybookApp) > -1) {
      storybookApp = config.storybookApp;
    }
    storybookVersion = config.storybookVersion;
  } else {
    // check storybook module
    try {
      var pkg = storybookCheck(require(process.cwd() + '/package.json'));
      storybookApp = pkg.app;
      storybookVersion = pkg.version;
    } catch(ex) {
      return callback(ex);
    }
  }
  // find free port
  getPort().then(function (port) {
    // inject temp storybook config file to get storybook
    var configPath = path.resolve(process.cwd(), config.storybookConfigDir, 'config.js');
    if (!fs.existsSync(configPath)) {
      return callback(new Error('Storybook config file not found: ' + configPath));
    }
    var configBody = fs.readFileSync(configPath, 'utf8');
    var codeTemplate = fs.readFileSync(__dirname + '/templates/v' + storybookVersion + '.template', 'utf8');
    var code = template(codeTemplate)({ code: configBody, app: storybookApp });
    fs.writeFileSync(configPath, code, 'utf8');

    // start Storybook dev server
    var binPath = path.resolve(process.cwd(), 'node_modules/.bin');
    if (config.storybookBinPath) {
      binPath = config.storybookBinPath;
      console.log('Use custom storybook bin path: ' + binPath);
    }
    var bin = path.resolve(binPath, 'start-storybook');
    var isWin = false;
    if (/^win/.test(process.platform)) {
      isWin = true;
      bin += '.cmd';
    }
    var args = ['--port', port, '--config-dir', config.storybookConfigDir];
    if (config.storybookStaticDir) {
      args.push('--static-dir');
      args.push(config.storybookStaticDir);
    }
    console.log('\nStarting Storybook server...');
    console.log('>', 'start-storybook', args.join(' '), '\n');
    var serverProcess = spawn(bin, args, {detached: !isWin});
    if (options && (options.debug || options.serverOnly)) {
      serverProcess.stdout.on('data', function(data) { console.log(data.toString('utf8').trim()); });
      serverProcess.stderr.on('data', function(data) { console.error(data.toString('utf8').trim()); });
    }

    // clean-up all child processes when this process is terminated
    process.on('exit', function() {
      if (fs.readFileSync(configPath, 'utf8') !== configBody) {
        fs.writeFileSync(configPath, configBody, 'utf8');
      }
      if (!isWin) {
        process.kill(-serverProcess.pid);
      }
    });
    process.on('SIGINT', function () {
      process.exit();
    });
    process.on('uncaughtException', function() {
      process.exit(1);
    });

    // wait for storybook server to be ready
    setTimeout(function() {
      request.get('http://localhost:' + port + '/static/preview.bundle.js', function(err, response, body) {
        if (err) return callback(err);
        if (response.statusCode != 200 || !body) {
          return callback(new Error('Error fetching preview bundle from storybook server'));
        }
        previewCode = body;
        try {
          // reset config file to original code
          fs.writeFileSync(configPath, configBody, 'utf8');
        } catch(ex) {
          return callback(ex);
        }
        callback(null, port);
      });
    }, 3*1000);
  }).catch(callback);
};

exports.get = function(options, callback) {
  var setupCode = [
    fs.readFileSync(__dirname + '/polyfills/match-media.js', 'utf8'),
    fs.readFileSync(__dirname + '/polyfills/local-storage.js', 'utf8'),
    fs.readFileSync(__dirname + '/polyfills/event-source.js', 'utf8')
  ];
  var jsDomConfig = {
    html: '',
    src: setupCode.concat(previewCode),
    done: function (err, window) {
      if (err) return callback(err);
      if (!window || !window.__screener_storybook__) {
        console.error(colors.red('Error getting Storybook object'));
        if (options && options.debug) {
          console.error(colors.red('Please send debug output to support@screener.io'));
        } else {
          console.error(colors.red('Please re-run with --debug flag, and send debug output to support@screener.io'));
        }
        return callback(new Error('Storybook object not found'));
      }
      callback(null, window.__screener_storybook__);
    }
  };
  if (options && options.debug) {
    jsDomConfig.virtualConsole = jsdom.createVirtualConsole().sendTo(console);
  }
  // parse preview bundle js code and retrieve window object
  jsdom.env(jsDomConfig);
};
