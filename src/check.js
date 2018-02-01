var resolveModule = function(path) {
  var modulePath = null;
  try {
    modulePath = require.resolve(path);
  } catch(ex) { /* module not found */ }
  return modulePath;
};

var storybookCheck = function() {
  // look for Storybook module
  var deps = [
    resolveModule('@storybook/react'),
    resolveModule('@storybook/vue'),
    resolveModule('@storybook/angular'),
    resolveModule('@kadira/storybook')
  ];
  var result = {};
  if (deps[0]) {
    result = {
      app: 'react',
      version: 3
    };
  } else if (deps[1]) {
    result = {
      app: 'vue',
      version: 3
    };
  } else if (deps[2]) {
    result = {
      app: 'angular',
      version: 3
    };
  } else if (deps[3]) {
    result = {
      app: 'react',
      version: 2
    };
  } else {
    throw new Error('Storybook module not found');
  }
  return result;
};

module.exports = storybookCheck;
