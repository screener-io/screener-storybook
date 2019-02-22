var expect = require('chai').expect;
var rewire = require('rewire');
var storybookCheck = rewire('../src/check');

describe('screener-storybook/src/check', function() {

  it('should return react storybook v4', function() {
    var tmpRequire = function() {
      return {version: '4.0.0'};
    };
    tmpRequire.resolve = function(path) {
      if (path === '@storybook/react/package.json') {
        return 'package.json';
      }
      throw new Error();
    };
    storybookCheck.__set__('require', tmpRequire);
    var result = storybookCheck();
    expect(result).to.deep.equal({
      app: 'react',
      version: {
        major: 4,
        full: '4.0.0'
      }
    });
  });

  it('should return react storybook v5 beta version', function() {
    var tmpRequire = function() {
      return {version: '5.0.0-beta.3'};
    };
    tmpRequire.resolve = function(path) {
      if (path === '@storybook/react/package.json') {
        return 'package.json';
      }
      throw new Error();
    };
    storybookCheck.__set__('require', tmpRequire);
    var result = storybookCheck();
    expect(result).to.deep.equal({
      app: 'react',
      version: {
        major: 5,
        full: '5.0.0-beta.3'
      }
    });
  });

  it('should return react storybook v3', function() {
    var tmpRequire = function() {
      return {version: '3.3.0'};
    };
    tmpRequire.resolve = function(path) {
      if (path === '@storybook/react/package.json') {
        return 'package.json';
      }
      throw new Error();
    };
    storybookCheck.__set__('require', tmpRequire);
    var result = storybookCheck();
    expect(result).to.deep.equal({
      app: 'react',
      version: {
        major: 3,
        full: '3.3.0'
      }
    });
  });

  it('should return vue storybook v4', function() {
    var tmpRequire = function() {
      return {version: '4.0.0'};
    };
    tmpRequire.resolve = function(path) {
      if (path === '@storybook/vue/package.json') {
        return 'package.json';
      }
      throw new Error();
    };
    storybookCheck.__set__('require', tmpRequire);
    var result = storybookCheck();
    expect(result).to.deep.equal({
      app: 'vue',
      version: {
        major: 4,
        full: '4.0.0'
      }
    });
  });

  it('should return angular storybook v4', function() {
    var tmpRequire = function() {
      return {version: '4.0.0'};
    };
    tmpRequire.resolve = function(path) {
      if (path === '@storybook/angular/package.json') {
        return 'package.json';
      }
      throw new Error();
    };
    storybookCheck.__set__('require', tmpRequire);
    var result = storybookCheck();
    expect(result).to.deep.equal({
      app: 'angular',
      version: {
        major: 4,
        full: '4.0.0'
      }
    });
  });

  it('should return html storybook v4', function() {
    var tmpRequire = function() {
      return {version: '4.0.0'};
    };
    tmpRequire.resolve = function(path) {
      if (path === '@storybook/html/package.json') {
        return 'package.json';
      }
      throw new Error();
    };
    storybookCheck.__set__('require', tmpRequire);
    var result = storybookCheck();
    expect(result).to.deep.equal({
      app: 'html',
      version: {
        major: 4,
        full: '4.0.0'
      }
    });
  });

  it('should return react storybook v2', function() {
    var tmpRequire = function() {
      return {version: '4.0.0'};
    };
    tmpRequire.resolve = function(path) {
      if (path === '@kadira/storybook/package.json') {
        return 'package.json';
      }
      throw new Error();
    };
    storybookCheck.__set__('require', tmpRequire);
    var result = storybookCheck();
    expect(result).to.deep.equal({
      app: 'react',
      version: {
        major: 2,
        full: '2.0.0'
      }
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
