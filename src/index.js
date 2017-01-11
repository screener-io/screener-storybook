var Promise = require('bluebird');

exports.staticStorybook = Promise.promisify(require('./storybook/static'));

exports.getStorybook = function() {
  return require('./storybook');
};

exports.run = require('./runner').run;
