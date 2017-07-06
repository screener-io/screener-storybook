var expect = require('chai').expect;
var storybookCheck = require('../src/check');

describe('screener-storybook/src/check', function() {

  it('should error if there are no dependencies found', function() {
    try {
      storybookCheck();
    } catch (err) {
      expect(err.toString()).to.equal('Error: No dependencies found in package.json');
    }
    try {
      storybookCheck({});
    } catch (err) {
      expect(err.toString()).to.equal('Error: No dependencies found in package.json');
    }
  });

  it('should return react storybook v3', function() {
    var pjson = {
      devDependencies: {
        '@storybook/react': '^3.1.3'
      }
    };
    var result = storybookCheck(pjson);
    expect(result).to.deep.equal({
      app: 'react',
      version: 3,
      range: '^3.1.3'
    });
  });

  it('should return vue storybook v3', function() {
    var pjson = {
      devDependencies: {
        '@storybook/vue': '^3.0.0-alpha.0'
      }
    };
    var result = storybookCheck(pjson);
    expect(result).to.deep.equal({
      app: 'vue',
      version: 3,
      range: '^3.0.0-alpha.0'
    });
  });

  it('should return vue storybook v3', function() {
    var pjson = {
      devDependencies: {
        '@storybook/vue': '^3.0.0-alpha.0'
      }
    };
    var result = storybookCheck(pjson);
    expect(result).to.deep.equal({
      app: 'vue',
      version: 3,
      range: '^3.0.0-alpha.0'
    });
  });

  it('should return react storybook v2', function() {
    var pjson = {
      devDependencies: {
        '@kadira/storybook': '^2.35.0'
      }
    };
    var result = storybookCheck(pjson);
    expect(result).to.deep.equal({
      app: 'react',
      version: 2,
      range: '^2.35.0'
    });
  });

  it('should error when storybook not found', function() {
    var pjson = {
      dependencies: {},
      devDependencies: {}
    };
    try {
      storybookCheck(pjson);
    } catch (err) {
      expect(err.toString()).to.equal('Error: Storybook module not found in package.json');
    }
  });

  it('should error when storybook version is out of range', function() {
    var pjson = {
      devDependencies: {
        '@storybook/react': '^4.0.0'
      }
    };
    try {
      storybookCheck(pjson);
    } catch (err) {
      expect(err.toString()).to.equal('Error: Storybook version must be >= 2.17.0 and < 4.x');
    }
  });

});
