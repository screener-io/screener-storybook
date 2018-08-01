var expect = require('chai').expect;
var rewire = require('rewire');
var Promise = require('bluebird');
var StorybookRunner = rewire('../src/runner');
var pkg = require('../package.json');

var configWithPort = {
  apiKey: 'api-key',
  projectRepo: 'repo',
  storybookConfigDir: '.storybook',
  storybookPort: 6006,
  storybookPreview: '/preview.html',
  storybook: [
    {
      kind: 'Component 1',
      stories: [
        {name: 'default'}
      ]
    }
  ]
};

var configWithSteps = {
  apiKey: 'api-key',
  projectRepo: 'repo',
  storybookConfigDir: '.storybook',
  storybookPort: 6006,
  storybookPreview: '/preview.html',
  storybook: [
    {
      kind: 'Component 1',
      stories: [
        {
          name: 'default',
          steps: [
            {
              type: 'clickElement',
              locator: {
                type: 'css selector',
                value: 'selector'
              }
            },
            {
              type: 'saveScreenshot',
              name: 'name'
            }
          ]
        }
      ]
    }
  ]
};

var runnerMock = {
  run: function(runnerConfig) {
    return Promise.resolve(runnerConfig);
  }
};

describe('screener-storybook/src/runner', function() {
  beforeEach(function() {
    StorybookRunner.__set__('Runner', runnerMock);
  });

  describe('StorybookRunner.run', function() {
    it('should transform config data to expected screener-runner format with screenerPort set', function() {
      return StorybookRunner.run(configWithPort, {debug: true})
        .then(function(runnerConfig) {
          expect(runnerConfig).to.deep.equal({
            apiKey: 'api-key',
            projectRepo: 'repo',
            tunnel: {
              host: 'localhost:6006',
              gzip: true,
              cache: true
            },
            states: [
              {
                url: 'http://localhost:6006/preview.html?dataId=0&selectedKind=Component%201&selectedStory=default',
                name: 'Component 1: default'
              }
            ],
            meta: {
              'screener-storybook': pkg.version
            }
          });
        });
    });

    it('should pass through includeRules and excludeRules', function() {
      var testConfig = JSON.parse(JSON.stringify(configWithPort));
      testConfig.includeRules = ['include', /^include/];
      testConfig.excludeRules = ['exclude', /^exclude/];
      return StorybookRunner.run(testConfig)
        .then(function(runnerConfig) {
          expect(runnerConfig.includeRules).to.deep.equal(['include', /^include/]);
          expect(runnerConfig.excludeRules).to.deep.equal(['exclude', /^exclude/]);
        });
    });

    it('should pass through ignore, hide, beforeEachScript options', function() {
      var testConfig = JSON.parse(JSON.stringify(configWithPort));
      testConfig.ignore = 'ignore';
      testConfig.hide = 'hide';
      testConfig.beforeEachScript = function() {};
      return StorybookRunner.run(testConfig)
        .then(function(runnerConfig) {
          expect(runnerConfig).to.have.property('ignore', 'ignore');
          expect(runnerConfig).to.have.property('hide', 'hide');
          expect(runnerConfig).to.have.property('beforeEachScript', testConfig.beforeEachScript);
        });
    });

    it('should remove storybook-specific props', function() {
      var testConfig = JSON.parse(JSON.stringify(configWithPort));
      testConfig.storybookStaticDir = '/static';
      testConfig.storybookApp = 'react';
      testConfig.storybookVersion = 3;
      testConfig.storybookBinPath = '/path';
      return StorybookRunner.run(testConfig)
        .then(function(runnerConfig) {
          expect(runnerConfig).to.not.have.property('storybook');
          expect(runnerConfig).to.not.have.property('storybookConfigDir');
          expect(runnerConfig).to.not.have.property('storybookStaticDir');
          expect(runnerConfig).to.not.have.property('storybookPort');
          expect(runnerConfig).to.not.have.property('storybookApp');
          expect(runnerConfig).to.not.have.property('storybookVersion');
          expect(runnerConfig).to.not.have.property('storybookBinPath');
        });
    });

    it('should include steps when transforming to states', function() {
      return StorybookRunner.run(configWithSteps)
        .then(function(runnerConfig) {
          expect(runnerConfig).to.deep.equal({
            apiKey: 'api-key',
            projectRepo: 'repo',
            tunnel: {
              host: 'localhost:6006',
              gzip: true,
              cache: true
            },
            states: [
              {
                url: 'http://localhost:6006/preview.html?dataId=0&selectedKind=Component%201&selectedStory=default',
                name: 'Component 1: default',
                steps: [
                  {
                    type: 'clickElement',
                    locator: {
                      type: 'css selector',
                      value: 'selector'
                    }
                  },
                  {
                    type: 'saveScreenshot',
                    name: 'name'
                  }
                ]
              }
            ],
            meta: {
              'screener-storybook': pkg.version
            }
          });
        });
    });
  });
});
