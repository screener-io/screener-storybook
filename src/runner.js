var validate = require('./validate');
var Runner = require('screener-runner');
var cloneDeep = require('lodash/cloneDeep');
var omit = require('lodash/omit');
var url = require('url');
var pkg = require('../package.json');

// transform storybook object into screener states
var transformToStates = function(storybook, baseUrl, previewRoute) {
  // clean baseUrl. remove query/hash/trailing-slash
  var urlObj = url.parse(baseUrl);
  urlObj = omit(urlObj, 'hash', 'search', 'query');
  urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
  baseUrl = url.format(urlObj);
  // transform into states
  var states = [];
  storybook.forEach(function(component) {
    component.stories.forEach(function(story) {
      var previewUrl = baseUrl + previewRoute + '?dataId=0&selectedKind=' + encodeURIComponent(component.kind) + '&selectedStory=' + encodeURIComponent(story.name);
      var state = {
        url: previewUrl,
        name: component.kind + ': ' + story.name
      };
      if (story.steps) {
        state.steps = story.steps;
      }
      states.push(state);
    });
  });
  return states;
};

exports.run = function(config, options) {
  // create copy of config
  config = cloneDeep(config);
  return validate.storybookConfig(config)
    .then(function() {
      // add package version
      config.meta = {
        'screener-storybook': pkg.version
      };
      var host = 'localhost:' + config.storybookPort;
      var localUrl = 'http://' + host;
      // add tunnel details only when sauce object does not exist or it exists but launchSauceConnect flag is false
      if (!config.sauce || !config.sauce.launchSauceConnect) {
        config.tunnel = {
          host: host,
          gzip: true,
          cache: true
        };
      }
      // generate config format expected by screener-runner
      config.states = transformToStates(config.storybook, localUrl, config.storybookPreview);
      // remove storybook-specific fields
      config = omit(config, ['storybook', 'storybookConfigDir', 'storybookStaticDir', 'storybookStaticBuildDir', 'storybookPort', 'storybookApp', 'storybookVersion', 'storybookBinPath', 'storybookPreview']);
      if (options && options.debug) {
        console.log('DEBUG: config', JSON.stringify(config, null, 2));
      }
      // send storybook states to screener-runner
      return Runner.run(config);
    });
};
