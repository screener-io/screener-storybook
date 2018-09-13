var Storybook = require('./storybook');
var Promise = require('bluebird');
var compact = require('lodash/compact');
var colors = require('colors/safe');

exports.startStorybook = Promise.promisify(Storybook.server);

exports.getStorybook = function(options) {
  var getStorybook = Promise.promisify(Storybook.get);
  return getStorybook(options)
    .then(function(storybook) {
      if (options && options.debug) {
        console.log('DEBUG: getStorybook', JSON.stringify(storybook, null, 2));
      }
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
                      // recursively find screener steps
                      var findScreenerSteps = function(current) {
                        if (current && current.props) {
                          if (current.props.isScreenerComponent === true) {
                            return current.props.steps;
                          } else {
                            var steps = null;
                            if (typeof current.props.story === 'function') {
                              steps = findScreenerSteps(current.props.story());
                            }
                            if (!steps && typeof current.props.storyFn === 'function') {
                              steps = findScreenerSteps(current.props.storyFn());
                            }
                            if (!steps && current.props.initialContent) {
                              steps = findScreenerSteps(current.props.initialContent);
                            }
                            if (!steps && current.props.children) {
                              var children = current.props.children;
                              // handle array of children
                              if (typeof children === 'object' && typeof children.map === 'function' && children.length > 0) {
                                for (var i = 0, len = children.length; i < len; i++) {
                                  steps = findScreenerSteps(children[i]);
                                  if (steps) break;
                                }
                              } else {
                                steps = findScreenerSteps(children);
                              }
                            }
                            return steps;
                          }
                        }
                      };
                      // get steps
                      var steps = findScreenerSteps(result);
                      if (steps) {
                        obj.steps = steps;
                      }
                    } else if (typeof result.render === 'function' || (typeof result.components === 'object' && typeof result.components.story === 'object')) {
                      // recursively find screener steps in render function
                      var findScreenerStepsInRender = function(current) {
                        if (typeof current.steps === 'object' && typeof current.steps.map === 'function' && current.steps.length > 0) {
                          return current.steps;
                        }
                        var steps = null;
                        if (typeof current.render === 'function') {
                          try {
                            steps = findScreenerStepsInRender(current.render(function(fn) {
                              return fn;
                            }));
                          } catch (ex) {
                            steps = null;
                          }
                        }
                        if (typeof current.components === 'object' && typeof current.components.story === 'object' && typeof current.components.story.render === 'function') {
                          try {
                            steps = findScreenerStepsInRender(current.components.story.render(function(fn) {
                              return fn;
                            }, {}));
                          } catch (ex) {
                            steps = null;
                          }
                        }
                        return steps;
                      };
                      // get steps
                      var stepsInRender = findScreenerStepsInRender(result);
                      if (stepsInRender) {
                        obj.steps = stepsInRender;
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
