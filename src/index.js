var Promise = require('bluebird');
var compact = require('lodash/compact');
var colors = require('colors/safe');

exports.startStorybook = Promise.promisify(require('./storybook/server'));

exports.getStorybook = function(options) {
  var getStorybook = Promise.promisify(require('./storybook'));
  return getStorybook(options)
    .then(function(storybook) {
      if (storybook instanceof Array) {
        // make copy and extract steps
        storybook = compact(storybook.map(function(kind) {
          // check kind format
          if (typeof kind !== 'object' || !kind.kind || !kind.stories || !(kind.stories instanceof Array) || kind.stories.length === 0) {
            console.log(colors.yellow('WARNING: Invalid kind format. Skipping.'));
            console.log(kind);
            return null;
          }
          return {
            kind: kind.kind,
            stories: compact(kind.stories.map(function(story) {
              // check story format
              if (typeof story !== 'object' || !story.name || typeof story.name !== 'string') {
                console.log(colors.yellow('WARNING: Invalid story format in \'' + kind.kind + '\'. Skipping story.'));
                console.log(kind);
                return null;
              }
              var obj = {
                name: story.name
              };
              if (typeof story.render === 'function') {
                try {
                  var result = story.render();
                  // check if <Screener> is top-most component
                  if (result && result.type && result.props && result.type.name === 'Screener') {
                    // get steps prop
                    obj.steps = result.props.steps;
                  }
                } catch (ex) {
                  console.error(ex);
                }
              }
              return obj;
            }))
          };
        }));
      }
      return storybook;
    });
};

exports.run = require('./runner').run;
