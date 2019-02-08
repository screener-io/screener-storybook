function getStorySteps(storybook) {
  var compact = function(array) {
    return array.filter(function(item) {
      return item != null;
    });
  };
  if (typeof storybook === 'object' && typeof storybook.map === 'function') {
    // make copy and extract steps
    storybook = compact(storybook.map(function(kind) {
      // check kind format
      if (typeof kind !== 'object' || !kind.kind || !kind.stories || !(typeof kind.stories === 'object' && typeof kind.stories.map === 'function') || kind.stories.length === 0) {
        console.log('WARNING: Invalid kind format. Skipping.');
        console.log(kind);
        return null;
      }
      return {
        kind: kind.kind,
        stories: compact(kind.stories.map(function(story) {
          // check story format
          if (typeof story !== 'object' || !story.name || typeof story.name !== 'string') {
            console.log('WARNING: Invalid story format in \'' + kind.kind + '\'. Skipping story.');
            console.log(kind);
            return null;
          }
          var obj = {
            name: story.name
          };
          console.log('STORY', story);
          if (typeof story.render === 'function') {
            try {
              var result = story.render(kind);
              console.log('STORY', story);
              console.log('RESULT', result);

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
              console.error('Error processing render() method of:', story);
              console.error(ex.stack || ex.message || ex.toString());
            }
          }
          return obj;
        }))
      };
    }));
  }
  return storybook;
}

if (typeof window === 'object') {
  // eslint-disable-next-line no-undef
  getStorySteps(window.__screener_storybook__());
} else if (typeof module === 'object') {
  // export for testing purposes
  module.exports = getStorySteps;
}
