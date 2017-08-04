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

    it('should throw error when no storybookConfigDir', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo'})
        .catch(function(err) {
          expect(err.message).to.equal('child "storybookConfigDir" fails because ["storybookConfigDir" is required]');
        });
    });

    it('should throw error when no storybookPort', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook'})
        .catch(function(err) {
          expect(err.message).to.equal('child "storybookPort" fails because ["storybookPort" is required]');
        });
    });

    it('should throw error when no storybook', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006})
        .catch(function(err) {
          expect(err.message).to.equal('child "storybook" fails because ["storybook" is required]');
        });
    });

    it('should allow storybook with no stories', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: []})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should throw error when storybook item is invalid', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [{kind: 'Temp'}]})
        .catch(function(err) {
          expect(err.message).to.equal('child "storybook" fails because ["storybook" at position 0 fails because [child "stories" fails because ["stories" is required]]]');
        });
    });

    it('should allow adding optional fields', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookStaticDir: './public', storybookPort: 6006, storybook: [], build: 'build', branch: 'branch', commit: 'commit', resolution: '1280x1024', cssAnimations: true, ignore: 'ignore', hide: 'hide', includeRules: [], excludeRules: [], initialBaselineBranch: 'master', baseBranch: 'master', diffOptions: {}, beforeEachScript: function() {}})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should allow include/exclude rules that are strings', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], includeRules: ['string'], excludeRules: ['string']})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should allow include/exclude rules that are regex expressions', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], includeRules: [/^string$/], excludeRules: [/^string$/]})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should throw error when include/exclude rules are not in array', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], includeRules: 'string', excludeRules: 'string'})
        .catch(function(err) {
          expect(err.message).to.equal('child "includeRules" fails because ["includeRules" must be an array]');
        });
    });

    it('should throw error when resolution in incorrect format', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], resolution: 'resolution'})
        .catch(function(err) {
          expect(err.message).to.equal('child "resolution" fails because ["resolution" with value "resolution" fails to match the resolution pattern, "resolution" must be an object, "resolution" must be an object]');
        });
    });

    it('should throw error when field is unknown', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], someKey: 'key'})
        .catch(function(err) {
          expect(err.message).to.equal('"someKey" is not allowed');
        });
    });

    describe('validate.failureExitCode', function() {
      it('should allow setting to 0', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], failureExitCode: 0})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should error when setting above 255', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], failureExitCode: 256})
          .catch(function(err) {
            expect(err.message).to.equal('child "failureExitCode" fails because ["failureExitCode" must be less than or equal to 255]');
          });
      });
    });

    describe('validate.storybookBinPath', function() {
      it('should error when storybookBinPath is set without storybookVersion', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], storybookBinPath: '/path'})
          .catch(function(err) {
            expect(err.message).to.equal('"storybookBinPath" missing required peer "storybookVersion"');
          });
      });

      it('should allow setting storybookVersion to 2 or 3', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], storybookVersion: 2})
          .then(function() {
            return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], storybookVersion: 3});
          })
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should error when setting storybookVersion to any value not 2 or 3', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], storybookVersion: 1})
          .catch(function(err) {
            expect(err.message).to.equal('child "storybookVersion" fails because ["storybookVersion" must be one of [2, 3]]');
            return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], storybookVersion: 4})
            .catch(function(err) {
              expect(err.message).to.equal('child "storybookVersion" fails because ["storybookVersion" must be one of [2, 3]]');
            });
          });
      });

      it('should allow setting storybookApp to react or vue', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], storybookApp: 'react'})
          .then(function() {
            return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], storybookApp: 'vue'});
          })
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should error when setting storybookApp to any value not react or vue', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], storybookApp: 'angular'})
          .catch(function(err) {
            expect(err.message).to.equal('child "storybookApp" fails because ["storybookApp" must be one of [react, vue]]');
          });
      });

      it('should allow when both storybookBinPath and storybookVersion', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], storybookVersion: 3, storybookBinPath: '/path'})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });
    });

    describe('validate.browsers', function() {
      it('should error when browsers is empty', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], browsers: []})
          .catch(function(err) {
            expect(err.message).to.equal('child "browsers" fails because ["browsers" must contain at least 1 items]');
          });
      });

      it('should error when browsers is set without sauce', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], browsers: [{ browserName: 'chrome' }]})
          .catch(function(err) {
            expect(err.message).to.equal('"browsers" missing required peer "sauce"');
          });
      });

      it('should allow browsers with sauce config', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybook: [], browsers: [{ browserName: 'firefox', version: '53.0' }], sauce: { username: 'user', accessKey: 'key' }})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });
    });

  });
});
