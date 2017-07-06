var Storybook = require('./storybook');
var Promise = require('bluebird');
var compact = require('lodash/compact');
var colors = require('colors/safe');

exports.startStorybook = Promise.promisify(Storybook.server);

exports.getStorybook = function(options) {
  var getStorybook = Promise.promisify(Storybook.get);
  return getStorybook(options)
    .then(function(storybook) {
      if (typeof storybook === 'object' && typeof storybook.map === 'function') {
        // make copy and extract steps
        storybook = compact(storybook.map(function(kind) {
          // check kind format
          if (typeof kind !== 'object' || !kind.kind || !kind.stories || !(typeof kind.stories === 'object' && typeof kind.stories.map === 'function') || kind.stories.length === 0) {
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
                  var result = story.render(kind);

                  if (result) {
                    if (typeof result.steps === 'object' && typeof result.steps.map === 'function' && result.steps.length > 0) {
                      obj.steps = result.steps;
                    } else if (result.props) {
                      // check if <Screener> is a wrapping component
                      if (result.type && result.type.name === 'Screener') {
                        // get steps
                        obj.steps = result.props.steps;
                      } else if (result.props.initialContent && result.props.initialContent.props && result.props.initialContent.props.children && result.props.initialContent.props.children.props && result.props.initialContent.props.children.type && result.props.initialContent.props.children.type.name === 'Screener') {
                        // get steps
                        obj.steps = result.props.initialContent.props.children.props.steps;
                      }
                    }
                  }
                } catch(ex) {
                  if (options && options.debug) {
                    console.error(colors.red('Error processing render() method of:'), story);
                    console.error(colors.red(ex.stack || ex.message || ex.toString()));
                  }
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
