var React = require('react');
var extend = require('lodash/extend');

function Screener(p) {
  return React.createElement('div', null, p.children);
}

Screener.propTypes = {
  children: React.PropTypes.any,
  steps: React.PropTypes.array
};

exports.default = Screener;
exports.Steps = require('screener-runner/src/steps');

module.exports = extend(exports.default, exports);
