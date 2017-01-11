/* globals window, document */
var jsdom = require('jsdom').jsdom;

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach(function(property) {
  if (typeof global[property] === 'undefined') {
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'screener',
};

global.localStorage = global.window.localStorage = {
  _data: {},
  setItem: function(id, val) { this._data[id] = String(val); },
  getItem: function(id) { return this._data[id] ? this._data[id] : undefined; },
  removeItem: function(id) { delete this._data[id]; },
  clear: function() { this._data = {}; },
};

window.matchMedia = function() {
  return { matches: true };
};
