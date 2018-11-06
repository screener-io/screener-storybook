var semver = require('semver');

var checkApp = function(app) {
  try {
    var packagePath = require.resolve(app.path + '/package.json');
    var packageVersion = require(packagePath).version;
    var versionObj = {
      major: semver.major(packageVersion),
      full: packageVersion
    };
    return {
      app: app.name,
      version: app.version || versionObj
    };
  } catch(ex) {
    // module not found
    return null;
  }
};

var storybookCheck = function() {
  // look for Storybook module
  var apps = [
    { path: '@storybook/react', name: 'react' },
    { path: '@storybook/vue', name: 'vue' },
    { path: '@storybook/angular', name: 'angular' },
    { path: '@kadira/storybook', name: 'react', version: { major: 2, full: '2.0.0' } }
  ];
  var result = null;
  for (var i = 0, len = apps.length; i < len; i++) {
    var app = checkApp(apps[i]);
    if (app) {
      result = app;
      break;
    }
  }
  if (!result) {
    throw new Error('Storybook module not found');
  }
  return result;
};

module.exports = storybookCheck;
