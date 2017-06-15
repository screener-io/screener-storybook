window.localStorage = window.localStorage || {
  _data       : {},
  setItem     : function(id, val) { return this._data[id] = String(val); },
  getItem     : function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
  removeItem  : function(id) { return delete this._data[id]; },
  clear       : function() { return this._data = {}; }
};
