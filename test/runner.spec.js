var expect = require('chai').expect;
var rewire = require('rewire');
var Promise = require('bluebird');
var StorybookRunner = rewire('../src/runner');

var configWithPort = {
  apiKey: 'api-key',
  projectRepo: 'repo',
  storybookPort: 6006,
  storybook: [
    {
      kind: 'Component 1',
      stories: [
        {name: 'default'}
      ]
    }
  ]
};

var configWithUrl = {
  apiKey: 'api-key',
  projectRepo: 'repo',
  storybookUrl: 'http://url.com/',
  storybook: [
    {
      kind: 'Component 1',
      stories: [
        {name: 'default'}
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
      return StorybookRunner.run(configWithPort)
        .then(function(runnerConfig) {
          expect(runnerConfig).to.deep.equal({
            apiKey: 'api-key',
            projectRepo: 'repo',
            tunnel: {
              host: 'localhost:6006'
            },
            states: [
              {
                url: 'http://localhost:6006/iframe.html?dataId=0&selectedKind=Component%201&selectedStory=default',
                name: 'Component 1: default'
              }
            ]
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

    it('should transform config data to expected screener-runner format with screenerUrl set', function() {
      return StorybookRunner.run(configWithUrl)
        .then(function(runnerConfig) {
          expect(runnerConfig).to.deep.equal({
            apiKey: 'api-key',
            projectRepo: 'repo',
            states: [
              {
                url: 'http://url.com/iframe.html?dataId=0&selectedKind=Component%201&selectedStory=default',
                name: 'Component 1: default'
              }
            ]
          });
        });
    });
  });
});
