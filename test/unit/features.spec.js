var expect = require('chai').expect;
var rewire = require('rewire');
var features = rewire('../../src/features');
const getStorybookFeatures = features.getStorybookFeatures;

describe('screener-storybook/src/features', function() {

  describe('Storybook 6.4 + StoryStore 7', function() {
    // TODO: can we reliably determine installed Storybook version when it's not a direct dependency?
    // TODO: Missing getStorybookFeatures when they don't exist

    it('looks for storybook framework and features', function() {
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

      const storybookFeatures = getStorybookFeatures();
      expect(storybookFeatures).to.deep.equal({
        framework: '@storybook/react',
        features: {
          storyStoreV7: true
        },
        dotStorybookPath: '/home/user/sut/.storybook/main.js',
        mainjs: '/home/user/sut/.storybook/main.js',
        previewSource: '/home/user/sut/.storybook/main.js',
        siteUnderTestPath: '/home/user/sut',
      });
    });
  }); // 'Storybook 6.4 + StoryStore 7'

});
