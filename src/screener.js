var React = require('react');
var PropTypes = require('prop-types');
var extend = require('lodash/extend');

function Screener(p) {
  return React.createElement('div', null, p.children);
}

Screener.propTypes = {
  children: PropTypes.any,
  steps: PropTypes.array,
  isScreenerComponent: PropTypes.bool
};

Screener.defaultProps = {
  isScreenerComponent: true
};

exports.default = Screener;
exports.Steps = require('screener-runner/src/steps');
exports.Keys = require('screener-runner/src/keys');

module.exports = extend(exports.default, exports);
