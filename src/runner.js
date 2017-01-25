var validate = require('./validate');
var Runner = require('screener-runner');
var cloneDeep = require('lodash/cloneDeep');
var omit = require('lodash/omit');
var url = require('url');

// transform storybook object into screener states
var transformToStates = function(storybook, baseUrl) {
  // clean baseUrl. remove query/hash/trailing-slash
  var urlObj = url.parse(baseUrl);
  urlObj = omit(urlObj, 'hash', 'search', 'query');
  urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
  baseUrl = url.format(urlObj);
  // transform into states
  var states = [];
  storybook.forEach(function(component) {
    component.stories.forEach(function(story) {
      var iframeUrl = baseUrl + '/iframe.html?dataId=0&selectedKind=' + encodeURIComponent(component.kind) + '&selectedStory=' + encodeURIComponent(story.name);
      var state = {
        url: iframeUrl,
        name: component.kind + ': ' + story.name
      };
      if (story.steps && story.steps instanceof Array) {
        state.steps = story.steps;
      }
      states.push(state);
    });
  });
  return states;
};

exports.run = function(config) {
  // create copy of config
  config = cloneDeep(config);
  return validate.storybookConfig(config)
    .then(function() {
      if (config.storybookPort) {
        var host = 'localhost:' + config.storybookPort;
        config.storybookUrl = 'http://' + host;
        // add tunnel details
        config.tunnel = {
          host: host
        };
      }
      // generate config format expected by screener-runner
      config.states = transformToStates(config.storybook, config.storybookUrl);
      // remove storybook-specific fields
      config = omit(config, ['storybook', 'storybookPort', 'storybookUrl']);
      // send storybook states to screener-runner
      return Runner.run(config);
    });
};
