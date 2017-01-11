var semver = require('semver');

module.exports = function() {
  var workingDir = process.cwd();
  var pjson = require(workingDir + '/package.json');
  var storybookVersion = pjson.dependencies['@kadira/storybook'] || pjson.devDependencies['@kadira/storybook'];
  // check if storybook exists
  if (!storybookVersion) {
    throw new Error('Storybook module not found in package.json');
  }
  // check storybook version
  if ((!semver.satisfies('2.17.0', storybookVersion) && !semver.ltr('2.17.0', storybookVersion)) || semver.satisfies('3.0.0', storybookVersion)) {
    throw new Error('Storybook version must be >= 2.17.0 and < 3.x');
  }
  // find storybook script
  var storybookScript = pjson.scripts && pjson.scripts['build-storybook'];
  if (!storybookScript) {
    throw new Error('"build-storybook" script not found in package.json');
  }
  // parse "build-storybook" script and find output-dir
  var outputDir = 'storybook-static';
  var args = storybookScript.split(/\s+/);
  for (var i = 0, len = args.length; i < len; i++) {
    if ((args[i] === '-o' || args[i] === '--output-dir') && args[i + 1]) {
      outputDir = args[i + 1];
      break;
    }
  }
  return outputDir;
};
