var path = require('path');
var fs = require('fs');
var portfinder = require('portfinder');
var spawn = require('child_process').spawn;
var request = require('request');
var jsdom = require('jsdom');
var semver = require('semver');
var colors = require('colors/safe');

var storybookVersion;
var previewCode;

var storybookCheck = function() {
  var pjson = require(process.cwd() + '/package.json');
  var storybookRange = pjson.dependencies['@storybook/react'] || pjson.devDependencies['@storybook/react'];
  if (storybookRange) {
    storybookVersion = 3;
  } else {
    storybookRange = pjson.dependencies['@kadira/storybook'] || pjson.devDependencies['@kadira/storybook'];
    if (storybookRange) {
      storybookVersion = 2;
    }
  }
  // check if storybook exists
  if (!storybookVersion) {
    throw new Error('Storybook module not found in package.json');
  }
  // check storybook version range
  if ((!semver.satisfies('2.17.0', storybookRange) && !semver.ltr('2.17.0', storybookRange)) || !semver.gtr('4.0.0', storybookRange)) {
    throw new Error('Storybook version must be >= 2.17.0 and < 4.x');
  }
};

exports.server = function(config, options, callback) {
  // check storybook module
  try {
    storybookCheck();
  } catch(ex) {
    return callback(ex);
  }
  if (!config || !config.storybookConfigDir) {
    return callback(new Error('Error: \'storybookConfigDir\' not found in config file.'));
  }
  // find free port
  portfinder.getPort(function (err, port) {
    if (err) return callback(err);
    // inject code into config file to get storybook and store in global variable
    // FIXME: this is hacky; is there a better way of doing this?
    var configPath = path.resolve(process.cwd(), config.storybookConfigDir, 'config.js');
    if (!fs.existsSync(configPath)) {
      return callback(new Error('Storybook config file not found: ' + configPath));
    }
    var configBody;
    var packageName = '@storybook/react';
    if (storybookVersion === 2) {
      packageName = '@kadira/storybook';
    }
    var code = '\nif (typeof window === \'object\') window.__screener_storybook__ = require(\'' + packageName + '\').getStorybook();';
    try {
      // save contents of config file
      configBody = fs.readFileSync(configPath, 'utf8');
      if (configBody.indexOf(code) === -1) {
        // append code to config file
        fs.appendFileSync(configPath, code, 'utf8');
      } else {
        // code is already in config file
        configBody = null;
      }
    } catch(ex) {
      return callback(ex);
    }
    // start Storybook dev server
    var bin = path.resolve(process.cwd(), 'node_modules/.bin/start-storybook');
    var args = ['--port', port, '--config-dir', config.storybookConfigDir];
    if (config.storybookStaticDir) {
      args.push('--static-dir');
      args.push(config.storybookStaticDir);
    }
    console.log('\nStarting Storybook server...');
    console.log('>', 'start-storybook', args.join(' '), '\n');
    var serverProcess = spawn(bin, args, {detached: true});
    if (options && (options.debug || options.serverOnly)) {
      serverProcess.stdout.on('data', function(data) { console.log(data.toString('utf8').trim()); });
      serverProcess.stderr.on('data', function(data) { console.error(data.toString('utf8').trim()); });
    }
    // clean-up all child processes when this process is terminated
    process.on('exit', function() {
      process.kill(-serverProcess.pid);
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
        if (response.statusCode != 200 || !body) return callback(new Error('Error fetching preview bundle from storybook server'));
        previewCode = body;
        try {
          // reset config file to original code
          if (configBody) fs.writeFileSync(configPath, configBody, 'utf8');
        } catch(ex) {
          return callback(ex);
        }
        callback(null, port);
      });
    }, 3*1000);
  });
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
