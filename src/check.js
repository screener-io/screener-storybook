const semver = require('semver');
const { getStorybookFeatures, isEmpty } = require('./features');

const checkApp = function(app) {
  try {
    var packagePath = require.resolve(app.path + '/package.json');
    var packageVersion = require(packagePath).version;
    var versionObj = {
      major: semver.major(packageVersion),
      minor: semver.minor(packageVersion),
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

//  Pre-storyStoreV7 approach using framework global hook
//
const storybookLegacyCheck = function() {
  // look for Storybook module
  var apps = [
    { path: '@storybook/react', name: 'react' },
    { path: '@storybook/vue', name: 'vue' },
    { path: '@storybook/angular', name: 'angular' },
    { path: '@storybook/html', name: 'html' },
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

//  First look for main.js framework and features.  Fall back to Storybook6- approach.
//  TODO: this provides 2 optional structures in return
//
const storybookCheck = function() {
  const storybookFeatureConfig = getStorybookFeatures();
  if (isEmpty(storybookFeatureConfig)) {
    return storybookLegacyCheck();
  }

  console.info('screener-storybook sees storybook configuration', storybookFeatureConfig);
  return storybookFeatureConfig;
};

module.exports = storybookCheck;
