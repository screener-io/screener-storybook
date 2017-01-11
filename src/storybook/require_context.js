var vm = require('vm');
var fs = require('fs');
var path = require('path');
var moduleSystem = require('module');

function requireModules(keys, root, directory, regExp, recursive) {
  var files = fs.readdirSync(path.join(root, directory));

  files.forEach(function(filename) {
    // webpack adds a './' to the begining of the key
    // TODO: Check this in windows
    var entryKey = `./${path.join(directory, filename)}`;
    if (regExp.test(entryKey)) {
      // eslint-disable-next-line no-param-reassign, global-require, import/no-dynamic-require
      keys[entryKey] = require(path.join(root, directory, filename));
      return;
    }

    if (!recursive) {
      return;
    }

    if (fs.statSync(path.join(root, directory, filename)).isDirectory()) {
      requireModules(keys, root, path.join(directory, filename), regExp, recursive);
    }
  });
}

function isRelativeRequest(request) {
  if (request.charCodeAt(0) !== 46/* .*/) {
    return false;
  }

  if (request === '.' || '..') {
    return true;
  }

  return request.charCodeAt(1) === 47/* /*/ || (
    request.charCodeAt(1) === 46/* .*/ && request.charCodeAt(2) === 47/* /*/);
}

module.exports = function runWithRequireContext(content, options) {
  var filename = options.filename;
  var dirname = options.dirname;

  var newRequire = function(request) {
    if (isRelativeRequest(request)) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(path.resolve(dirname, request));
    }

    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(request);
  };

  newRequire.resolve = require.resolve;
  newRequire.extensions = require.extensions;
  newRequire.main = require.main;
  newRequire.cache = require.cache;

  newRequire.context = function(directory, useSubdirectories, regExp) {
    if (typeof useSubdirectories === 'undefined') useSubdirectories = false;
    if (typeof regExp === 'undefined') regExp = /^\.\//;
    var fullPath = path.resolve(dirname, directory);
    var keys = {};
    requireModules(keys, fullPath, '.', regExp, useSubdirectories);

    var req = function(f) {
      return keys[f];
    };
    req.keys = function() {
      return Object.keys(keys);
    };
    return req;
  };

  var compiledModule = vm.runInThisContext(moduleSystem.wrap(content));
  compiledModule(module.exports, newRequire, module, filename, dirname);
};
