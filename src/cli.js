var program = require('commander');
var fs = require('fs');
var path = require('path');
var pjson = require('../package.json');
var colors = require('colors/safe');
var StorybookRunner = require('./index');
var Promise = require('bluebird');

program
  .version(pjson.version)
  .option('-c, --conf <config-file>', 'Path to Configuration File')
  .option('--server-only', 'Start Storybook Server only for testing purposes')
  .option('--debug', 'Enable debug mode')
  .parse(process.argv);

console.log(colors.bold('\nscreener-storybook v' + pjson.version + '\n'));

if (!program.conf) {
  console.error('--conf is a required argument. Type --help for more information.');
  process.exit(1);
}

var configPath = path.resolve(process.cwd(), program.conf);
if (!fs.existsSync(configPath)) {
  console.error('Config file path "' + program.conf + '" cannot be found.');
  process.exit(1);
}
var config = require(configPath);

if (config === false) {
  console.log('Config is false. Exiting...');
  process.exit();
}

// start local storybook server
StorybookRunner.startStorybook(config, program)
  .then(function(server) {
    if (!server || !server.port) throw new Error('Port not returned when starting Storybook server');
    if (program.serverOnly) {
      return new Promise(function() {});
    }
    config.storybookPort = server.port;
    config.storybookPreview = server.preview;
    if (program.debug) {
      console.log('DEBUG: config.storybookPort', server.port);
    }
    config.storybook = StorybookRunner.getStorybook(program);
    if (program.debug) {
      console.log('DEBUG: config.storybook', JSON.stringify(config.storybook, null, 2));
    }
    // run test against Screener
    return StorybookRunner.run(config, program);
  })
  .then(function(response) {
    console.log(response);
    process.exit();
  })
  .catch(function(err) {
    if (program && program.debug && err.stack) {
      console.error('DEBUG:', err.stack);
      if (typeof err.annotate === 'function') {
        console.error('Annotated Error Details:');
        console.error(err.annotate());
      }
    } else {
      console.error(err.message || err.toString());
    }
    console.error('---');
    console.error('Exiting Screener Storybook');
    console.error('Run with --debug flag to log additional information');
    console.error('Need help? Contact: help@saucelabs.com');
    var exitCode = 1;
    if (config && typeof config.failureExitCode === 'number' && config.failureExitCode > 0) {
      exitCode = config.failureExitCode;
    }
    process.exit(exitCode);
  });
