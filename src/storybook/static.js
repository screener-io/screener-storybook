var storybookCheck = require('./check');
var path = require('path');
var portfinder = require('portfinder');
var http = require('http');
var connect = require('connect');
var compression = require('compression');

module.exports = function(buildScriptName, config, callback) {
  if (typeof config === 'function') {
    callback = config;
    config = null;
  }
  var staticPath;
  if (config && config.storybookUrl) {
    // storybook is already running or available at another url
    return callback();
  }
  // check storybook module and get/resolve static directory
  try {
    staticPath = path.resolve(process.cwd(), storybookCheck(buildScriptName));
  } catch(ex) {
    return callback(ex);
  }
  // find free port
  portfinder.getPort(function (err, port) {
    if (err) return callback(err);
    var app = connect();
    var buffet = require('buffet')({root: staticPath});
    app.use(compression()); // gzip
    app.use(buffet);
    app.use(buffet.notFound);
    // start static web server
    http.createServer(app).listen(port, function(err) {
      if (err) return callback(err);
      callback(null, port);
    });
  });
};
