var semver = require('semver');

var storybookCheck = function(pjson) {
  if (!pjson || (!pjson.dependencies && !pjson.devDependencies)) {
    throw new Error('No dependencies found in package.json');
  }
  var deps = [
    (pjson.dependencies || {})['@storybook/react']  || (pjson.devDependencies || {})['@storybook/react'],
    (pjson.dependencies || {})['@storybook/vue']    || (pjson.devDependencies || {})['@storybook/vue'],
    (pjson.dependencies || {})['@kadira/storybook'] || (pjson.devDependencies || {})['@kadira/storybook']
  ];
  var result = {};
  if (deps[0]) {
    result = {
      app: 'react',
      version: 3,
      range: deps[0]
    };
  } else if (deps[1]) {
    result = {
      app: 'vue',
      version: 3,
      range: deps[1]
    };
  } else if (deps[2]) {
    result = {
      app: 'react',
      version: 2,
      range: deps[2]
    };
  } else {
    throw new Error('Storybook module not found in package.json');
  }
  // check storybook version range
  if ((!semver.satisfies('2.17.0', result.range) && !semver.ltr('2.17.0', result.range)) || !semver.gtr('4.0.0', result.range)) {
    throw new Error('Storybook version must be >= 2.17.0 and < 4.x');
  }
  return result;
};

module.exports = storybookCheck;
