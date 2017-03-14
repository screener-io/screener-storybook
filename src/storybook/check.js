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
};
