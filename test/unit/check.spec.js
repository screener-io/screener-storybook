var expect = require('chai').expect;
var rewire = require('rewire');
var storybookCheck = rewire('../../src/check');
var features = rewire('../../src/features');

describe('screener-storybook/src/check', function() {

  it('should return react storybook v6', function() {
    var tmpRequire = function() {
      return {version: '6.0.0'};
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
        major: 6,
        minor: 0,
        full: '6.0.0'
      }
    });
  });

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
        minor: 0,
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
        minor: 0,
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
        minor: 3,
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
        minor: 0,
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
        minor: 0,
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
        minor: 0,
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

  describe('Storybook 6.4 + StoryStore 7', function() {

    beforeEach(function() {
      const tmpRequire = function(path) {
        if (path === '/home/user/sut/.storybook/main.js') {
          // say the contents of .storybook/main.js look like this
          return {
            framework: '@storybook/react',
            features: {
              storyStoreV7: true,
            }
          };
        }
        return { version: '6.5.12' };
      };
      tmpRequire.resolve = function(path) {
        if (path === '@storybook/react/package.json') {
          return 'package.json';
        }
        else if (path === '.') {
          return '/home/user/sut';
        }
        throw new Error();
      };

      const tmpPath = function() {};
      tmpPath.resolve = function() {
        // say the location of '.' is this
        return '/home/user/sut';
      };
      tmpPath.join = function() {
        // then joining with .storybook/main.js
        return '/home/user/sut/.storybook/main.js';
      };

      const fsMock = {
        existsSync: function (path) {
          return path === '/home/user/sut/.storybook/main.js';
        }
      };

      features.__set__({
        'require': tmpRequire,
        'path': tmpPath,
        'fs': fsMock,
      });

      storybookCheck.__set__({
        'require': tmpRequire,
        'path': tmpPath,
        'fs': fsMock,
        'getStorybookFeatures': features.getStorybookFeatures,
      });
    });

    it('should return the main.js features and framework if present', function() {
      const result = storybookCheck();
      expect(result).to.deep.equal({
        framework: '@storybook/react',
        features: {
          storyStoreV7: true
        },
        dotStorybookPath: '/home/user/sut/.storybook/main.js',
        mainjs: '/home/user/sut/.storybook/main.js',
        siteUnderTestPath: '/home/user/sut',
      });
    });

  });

});
