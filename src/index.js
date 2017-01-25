var Promise = require('bluebird');

exports.staticStorybook = Promise.promisify(require('./storybook/static'));

exports.getStorybook = function() {
  var storybook = require('./storybook');
  if (storybook instanceof Array) {
    // make copy and extract steps
    storybook = storybook.map(function(kind) {
      return {
        kind: kind.kind,
        stories: kind.stories.map(function(story) {
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
        })
      };
    });
  }
  return storybook;
};

exports.run = require('./runner').run;
