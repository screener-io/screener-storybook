// var object = require('lodash/fp/object');

//  Receive raw stories we pull from the storybook server via puppeteer, align them for
//  legacy steps processing.
//
exports.alignStories = function(rawStories) {
  if (typeof rawStories === 'object') {
    if (rawStories.constructor === Array) {
      console.info('screener-storybook standard stories array detected');
      return rawStories;
    } else {
      console.warn('screener-storybook stories not returned in array, re-aligning ..');
      // return object.toPairs(rawStories);
      const objectToArray = Object.keys(rawStories);
      return objectToArray.map( (key) => {
        return rawStories[key];
      });
      // return Object.keys(rawStories);
    }
  }

  console.warn('screener-storybook raw stories was not recognized, using raw data');
  return rawStories;
};
