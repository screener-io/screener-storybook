var Storybook = require('./storybook');
var Promise = require('bluebird');

exports.startStorybook = Promise.promisify(Storybook.server);

exports.getStorybook = Storybook.get;

exports.run = require('./runner').run;
