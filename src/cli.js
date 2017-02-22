var program = require('commander');
var fs = require('fs');
var path = require('path');
var pjson = require('../package.json');
var colors = require('colors/safe');
var StorybookRunner = require('./index');
var handleError = function(err) {
  console.error(err.message || err.toString());
  console.error('---');
  console.error('Exiting Screener Storybook');
  console.error('Need help? Contact: support@screener.io');
  process.exit(1);
};

program
  .version(pjson.version)
  .option('-c, --conf <config-file>', 'Path to Configuration File')
  .option('--build-cmd <build-cmd>', 'Set NPM Command for Building Storybook. Defaults to: build-storybook')
  .option('--static-server-only', 'Start Static Server only for testing purposes')
  .option('--debug', 'Enable debug mode')
  .parse(process.argv);

console.log(colors.bold('\nscreener-storybook v' + pjson.version + '\n'));

if (program.staticServerOnly) {
  StorybookRunner.staticStorybook(program.buildCmd)
    .then(function(result) {
      if (result && result.port) {
        console.log('Static Storybook server started on http://localhost:' + result.port);
      } else {
        throw new Error('Static Storybook server could not be started.');
      }
    })
    .catch(handleError);
} else {
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
  StorybookRunner.staticStorybook(program.buildCmd, config)
    .then(function(result) {
      if (result && result.port) {
        config.storybookPort = result.port;
        console.log('Static Storybook server started on http://localhost:' + result.port);
      }
      // get storybook object, and add to config
      return StorybookRunner.getStorybook(result);
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
}
