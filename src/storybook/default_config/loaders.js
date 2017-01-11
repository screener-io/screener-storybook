var fileExts = ['jpg', 'png', 'gif', 'eot', 'svg', 'ttf', 'woff', 'woff2', 'md', 'mdown', 'markdown'];
var moduleExts = ['css', 'scss', 'sass'];

var loaders = {};

fileExts.forEach(function(ext) {
  loaders[ext] = function(filename) {
    return filename;
  };
});

moduleExts.forEach(function(ext) {
  loaders[ext] = function() {
    return null;
  };
});

module.exports = loaders;
