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
                        if (!steps && typeof current.type === 'function') {
                          try {
                            steps = findScreenerSteps(current.type());
                          } catch(ex) { /**/ }
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
//
//  Receive raw stories we pull from the storybook server via puppeteer, align them for
//  legacy steps processing.
//
function alignStories(storybook, store) {
  let alignedStories = [];
  const storeKeys = Object.keys(storybook);
  for (let storyID of storeKeys) {
    /* Important information about the future of storybook (version 7 & 8) */
    // Due to changes on storybook framework, which is going from systematically
    // loading all the stories at one to a progressive loading approach (https://storybook.js.org/blog/storybook-6-4/)
    // loading the each story at once should a future approach when extract (done at storybook.js)
    // and fromId (right below) gets removed from storybook base code. -- Unable to use at current point (SB6.4)
    // due to internal exceptions on the storybook framework
    // const story2 = await store.loadStory({ storyId: story.id });
    // const ctx = await store.getStoryContext(story);
    //
    // Get story from ID on the storybook store
    const story = store.fromId(storyID);
    //
    let objectStory = { name: story.name, render: story.storyFn };
    alignedStories.push({
      kind: story.kind,
      stories: [ objectStory ]
    });
  }
  return alignedStories;
}
//
// declare story steps & align stories inside this scope -- this is fundamentally required
// so puppeteer dont serialize objects across contexts and loose instance
// based functions for our stories
if (typeof this.window === 'object') {
  // Get store
  const store = this.window.__STORYBOOK_STORY_STORE__;
  // Ask for raw stories, but make compatible with V5 if getStoriesJsonData is not
  // declared on the stories store
  const storybook = store.getStoriesJsonData ? store.getStoriesJsonData().stories : store.extract();
  // Get aligned stories
  const alignedStories = alignStories(storybook, store);
  // Extract steps by rendering each component in the framework native form
  // and recursively going through each child and checking it we need a step
  // interaction for than as well. -- Important to recall, this function is 
  // called under puppeteer evaluation expression, which returns the value 
  // returned from the last expression -- similar to a return expression.
  getStorySteps(alignedStories);
} else if (typeof module === 'object') {
  // export for testing purposes
  exports.getStorySteps = getStorySteps;
  exports.alignStories = alignStories;
}
