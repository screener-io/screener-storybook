var expect = require('chai').expect;
var rewire = require('rewire');
var storybookCheck = rewire('../src/check');

describe('screener-storybook/src/check', function() {

  it('should return react storybook v3', function() {
    storybookCheck.__set__('require', {
      resolve: function(path) {
        if (path === '@storybook/react') {
          return true;
        }
      }
    });
    var result = storybookCheck();
    expect(result).to.deep.equal({
      app: 'react',
      version: 3
    });
  });

  it('should return vue storybook v3', function() {
    storybookCheck.__set__('require', {
      resolve: function(path) {
        if (path === '@storybook/vue') {
          return true;
        }
      }
    });
    var result = storybookCheck();
    expect(result).to.deep.equal({
      app: 'vue',
      version: 3
    });
  });

  it('should return react storybook v2', function() {
    storybookCheck.__set__('require', {
      resolve: function(path) {
        if (path === '@kadira/storybook') {
          return true;
        }
      }
    });
    var result = storybookCheck();
    expect(result).to.deep.equal({
      app: 'react',
      version: 2
    });
  });

  it('should error when storybook not found', function() {
    storybookCheck.__set__('require', {
      resolve: function() {}
    });
    try {
      storybookCheck();
    } catch (err) {
      expect(err.toString()).to.equal('Error: Storybook module not found');
    }
  });

});
