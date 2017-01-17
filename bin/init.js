#!/usr/bin/env node

/* eslint-disable */

var program = require('commander');
var prompt = require('prompt');
var colors = require('colors/safe');
var fs = require('fs');
var path = require('path');
var url = require('url');
var buildCmdOption = '';
var gitParse = require('parse-git-config');
var gitConfigPath = path.resolve(process.cwd(), '.git/config');
var configFileName = 'screener.conf.js';
var configPath = path.resolve(process.cwd(), configFileName);
var packagePath = path.resolve(process.cwd(), 'package.json');
var pjson = require(packagePath);
var handleError = function(err) {
  console.error('Error:', err.message || err.toString());
  process.exit(1);
};

program
  .version(require('../package.json').version)
  .option('-k, --key <api-key>', 'Screener API Key')
  .option('--build-cmd <build-cmd>', 'Set NPM Command for Building Storybook. Defaults to: build-storybook')
  .parse(process.argv);

if (!program.key) {
  handleError('--key is a required argument. Type --help for more information.');
}
if (program.buildCmd) {
  buildCmdOption = ' --build-cmd ' + program.buildCmd;
} else {
  program.buildCmd = 'build-storybook';
}

// check storybook exists/version
try {
  require('../src/storybook/check')(program.buildCmd);
} catch(ex) {
  handleError(ex);
}

// check if config file or script has already been added
if (fs.existsSync(configPath)) {
  handleError('Config file "' + configFileName + '" already exists.');
}
if (pjson.scripts && pjson.scripts['test-storybook']) {
  handleError('package.json file already contains a "test-storybook" script.');
}
if (pjson.scripts && pjson.scripts['test-storybook-server']) {
  handleError('package.json file already contains a "test-storybook-server" script.');
}

// get git repo slug
var gitSlug = '';
if (fs.existsSync(gitConfigPath)) {
  var gitConfig = gitParse.sync({cwd: process.cwd(), path: '.git/config'});
  if (gitConfig && gitConfig['remote "origin"'] && gitConfig['remote "origin"'].url) {
    gitSlug = url.parse(gitConfig['remote "origin"'].url).pathname.replace(/^\//, '').replace(/\.git$/, '');
  }
}

// instructions for prompt
console.log('\nSetup screener-storybook');
console.log('========================');
console.log('Please complete prompts below.');
console.log(colors.cyan('\nPress ENTER to use (default):\n'));

// prompt for additional required info
var promptSchema = {
  properties: {
    projectRepo: {
      pattern: /^[a-zA-Z0-9\/\.\-\_]{1,100}$/,
      message: 'projectRepo must consist of alphanumeric characters, dashes, underscores, periods or forward-slashes',
      required: true,
      default: gitSlug
    },
    resolution: {
      pattern: /^[0-9]{3,4}x[0-9]{3,4}$/,
      message: 'resolution must be in the following format: <width>x<height>. i.e. 1024x768',
      required: true,
      default: '1024x768'
    }
  }
};
prompt.message = colors.yellow('[?]');
prompt.delimiter = ' ';
prompt.start();
prompt.get(promptSchema, function(err, result) {
  if (err) return handleError(err);

  // generate screener config file and save into project root
var configFile = 'module.exports = {\n\
  apiKey: \'' + program.key + '\',\n\
  projectRepo: \'' + result.projectRepo + '\',\n\
  resolution: \'' + result.resolution + '\'\n\
};\n';
  fs.writeFileSync(configPath, configFile);

  // add scripts to package.json
  if (!pjson.scripts) {
    pjson.scripts = {};
  }
  pjson.scripts['test-storybook'] = 'npm run ' + program.buildCmd + ' && screener-storybook --conf ' + configFileName + buildCmdOption;
  pjson.scripts['test-storybook-server'] = 'npm run ' + program.buildCmd + ' && screener-storybook --static-server-only' + buildCmdOption;
  fs.writeFileSync(packagePath, JSON.stringify(pjson, null, 2) + '\n');

  console.log('\nGenerated ' + configFileName + ' and saved into project root:');
  console.log('  apiKey: ' + program.key);
  console.log('  projectRepo: ' + result.projectRepo);
  console.log('  resolution: ' + result.resolution);
  process.exit();
});
