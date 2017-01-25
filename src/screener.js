var React = require('react');

function Screener(p) {
  return React.createElement('div', null, p.children);
}

Screener.propTypes = {
  children: React.PropTypes.any,
  steps: React.PropTypes.array
};

Screener.Steps = require('screener-runner/src/steps');

module.exports = Screener;
