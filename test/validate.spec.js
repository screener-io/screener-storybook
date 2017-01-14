var expect = require('chai').expect;
var validate = require('../src/validate');

describe('screener-storybook/src/validate', function() {
  describe('validate.storybookConfig', function() {
    it('should throw error when no value passed in', function() {
      return validate.storybookConfig()
        .catch(function(err) {
          expect(err.message).to.equal('"value" is required');
        });
    });

    it('should throw error when no apiKey', function() {
      return validate.storybookConfig({})
        .catch(function(err) {
          expect(err.message).to.equal('child "apiKey" fails because ["apiKey" is required]');
        });
    });

    it('should throw error when no projectRepo', function() {
      return validate.storybookConfig({apiKey: 'key'})
        .catch(function(err) {
          expect(err.message).to.equal('child "projectRepo" fails because ["projectRepo" is required]');
        });
    });

    it('should throw error when no storybook', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo'})
        .catch(function(err) {
          expect(err.message).to.equal('child "storybook" fails because ["storybook" is required]');
        });
    });

    it('should allow storybook with no stories', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybook: [], storybookPort: 6006})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should throw error when storybook item is invalid', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybook: [{kind: 'Temp'}]})
        .catch(function(err) {
          expect(err.message).to.equal('child "storybook" fails because ["storybook" at position 0 fails because [child "stories" fails because ["stories" is required]]]');
        });
    });

    it('should throw error when no storybookPort or storybookUrl', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybook: []})
        .catch(function(err) {
          expect(err.message).to.equal('"value" must contain at least one of [storybookPort, storybookUrl]');
        });
    });

    it('should throw error when both storybookPort and storybookUrl are added', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybook: [], storybookPort: 6006, storybookUrl: 'http://url.com'})
        .catch(function(err) {
          expect(err.message).to.equal('"value" contains a conflict between exclusive peers [storybookPort, storybookUrl]');
        });
    });

    it('should allow storybookUrl when storybookPort not there', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybook: [], storybookUrl: 'http://url.om'})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should allow adding optional fields', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookPort: 6006, storybook: [], build: 'build', branch: 'branch', resolution: '1280x1024', ignore: 'ignore', includeRules: [], excludeRules: [], diffOptions: {}})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should allow include/exclude rules that are strings', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookPort: 6006, storybook: [], includeRules: ['string'], excludeRules: ['string']})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should allow include/exclude rules that are regex expressions', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookPort: 6006, storybook: [], includeRules: [/^string$/], excludeRules: [/^string$/]})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should throw error when include/exclude rules are not in array', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookPort: 6006, storybook: [], includeRules: 'string', excludeRules: 'string'})
        .catch(function(err) {
          expect(err.message).to.equal('child "includeRules" fails because ["includeRules" must be an array]');
        });
    });

    it('should throw error when resolution in incorrect format', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookPort: 6006, storybook: [], resolution: 'resolution'})
        .catch(function(err) {
          expect(err.message).to.equal('child "resolution" fails because ["resolution" with value "resolution" fails to match the resolution pattern]');
        });
    });

    it('should throw error when field is unknown', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookPort: 6006, storybook: [], someKey: 'key'})
        .catch(function(err) {
          expect(err.message).to.equal('"someKey" is not allowed');
        });
    });
  });
});
