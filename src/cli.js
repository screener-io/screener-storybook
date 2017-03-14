var program = require('commander');
var fs = require('fs');
var path = require('path');
var pjson = require('../package.json');
var colors = require('colors/safe');
var StorybookRunner = require('./index');
var Promise = require('bluebird');
var handleError = function(err) {
  if (program && program.debug && err.stack) {
    console.error('DEBUG:', err.stack);
  } else {
    console.error(err.message || err.toString());
  }
  console.error('---');
  console.error('Exiting Screener Storybook');
  console.error('Need help? Contact: support@screener.io');
  process.exit(1);
};

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

// start local storybook server
StorybookRunner.startStorybook(config)
  .then(function(port) {
    if (program.serverOnly) {
      return new Promise(function() {});
    }
    if (port) config.storybookPort = port;
    // get storybook object, and add to config
    var options = {
      port: config.storybookPort,
      debug: program.debug
    };
    return StorybookRunner.getStorybook(options);
  })
  .then(function(storybook) {
    config.storybook = storybook;
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
  .catch(handleError);
