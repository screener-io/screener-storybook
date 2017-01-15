var Promise = require('bluebird');
var pick = require('lodash/pick');

exports.staticStorybook = Promise.promisify(require('./storybook/static'));

exports.getStorybook = function() {
  var storybook = require('./storybook');
  // make copy and remove methods
  storybook = JSON.parse(JSON.stringify(storybook));
  if (storybook instanceof Array) {
    // remove any extra properties
    storybook = storybook.map(function(kind) {
      var obj = pick(kind, ['kind', 'stories']);
      obj.stories = obj.stories.map(function(story) {
        return pick(story, ['name']);
      });
      return obj;
    });
  }
  return storybook;
};

exports.run = require('./runner').run;
