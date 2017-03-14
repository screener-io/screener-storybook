var storybookCheck = require('./check');
var path = require('path');
var portfinder = require('portfinder');
var spawn = require('child_process').spawn;
var request = require('request');

module.exports = function(config, callback) {
  // check storybook module
  try {
    storybookCheck();
  } catch(ex) {
    return callback(ex);
  }
  if (config && (config.storybookUrl || config.storybookPort)) {
    // storybook server is already running or available at another url
    return callback();
  }
  if (!config || !config.storybookConfigDir) {
    return callback(new Error('Error: \'storybookConfigDir\' not found in config file.'));
  }
  // find free port
  portfinder.getPort(function (err, port) {
    if (err) return callback(err);

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
    serverProcess.stdout.on('data', function(data) { console.log(data.toString('utf8').trim()); });
    serverProcess.stderr.on('data', function(data) { console.error(data.toString('utf8').trim()); });
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
      request.get('http://localhost:' + port + '/static/preview.bundle.js', function(err, response) {
        if (err || response.statusCode != 200) return callback(err || response.statusCode);
        callback(null, port);
      });
    }, 3*1000);
  });
};
