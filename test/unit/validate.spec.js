var expect = require('chai').expect;
var validate = require('../../src/validate');

describe.only('screener-storybook/src/validate', function() {
  describe('validate.storybookConfig', function() {
    it('should throw error when no value passed in', function() {
      return validate.storybookConfig()
        .catch(function(err) {
          expect(err.message).to.equal('"value" is required');
        });
    });

    it('should throw error when no apiKey or username', function() {
      return validate.storybookConfig({ projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: []})
        .catch(function(err) {
          expect(err.message).to.equal('"value" must contain at least one of [username, apiKey]');
        });
    });
    
    it('should throw error when no accessKey if username', function() {
      return validate.storybookConfig({ username: 'username', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: []})
        .catch(function(err) {
          expect(err.message).to.equal('"value" contains [username] without its required peers [accessKey]');
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

    it('should throw error when no storybookPreview', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006})
        .catch(function(err) {
          expect(err.message).to.equal('child "storybookPreview" fails because ["storybookPreview" is required]');
        });
    });

    it('should throw error when no storybook', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html'})
        .catch(function(err) {
          expect(err.message).to.equal('child "storybook" fails because ["storybook" is required]');
        });
    });

    it('should allow storybook with no stories', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: []})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should throw error when storybook item is invalid', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [{kind: 'Temp'}]})
        .catch(function(err) {
          expect(err.message).to.equal('child "storybook" fails because ["storybook" at position 0 fails because [child "stories" fails because ["stories" is required]]]');
        });
    });

    it('should allow adding optional fields', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookStaticDir: './public', storybookStaticBuildDir: 'storybook-static', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], build: 'build', branch: 'branch', commit: 'commit', resolution: '1280x1024', cssAnimations: true, ignore: 'ignore', hide: 'hide', includeRules: [], excludeRules: [], initialBaselineBranch: 'master', baseBranch: 'master', alwaysAcceptBaseBranch: true, disableDiffOnError: true, diffOptions: {compareSVGDOM: true, minShiftGraphic: 5}, failOnNewStates: true, beforeEachScript: function() {}, ieNativeEvents: true})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should allow include/exclude rules that are strings', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], includeRules: ['string'], excludeRules: ['string']})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should allow include/exclude rules that are regex expressions', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], includeRules: [/^string$/], excludeRules: [/^string$/]})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should throw error when include/exclude rules are not in array', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], includeRules: 'string', excludeRules: 'string'})
        .catch(function(err) {
          expect(err.message).to.equal('child "includeRules" fails because ["includeRules" must be an array]');
        });
    });

    it('should throw error when resolution in incorrect format', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], resolution: 'resolution'})
        .catch(function(err) {
          expect(err.message).to.equal('child "resolution" fails because ["resolution" with value "resolution" fails to match the resolution pattern, "resolution" must be an object, "resolution" must be an object]');
        });
    });

    it('should throw error when field is unknown', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], someKey: 'key'})
        .catch(function(err) {
          expect(err.message).to.equal('"someKey" is not allowed');
        });
    });

    it('should allow useNewerBaseBranch option when baseBranch is set', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], useNewerBaseBranch: 'latest', baseBranch: 'master'})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should not allow useNewerBaseBranch option when baseBranch is not set', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], useNewerBaseBranch: 'latest'})
        .catch(function(err) {
          expect(err.message).to.equal('"useNewerBaseBranch" missing required peer "baseBranch"');
        });
    });

    it('should allow alwaysAcceptBaseBranch option when baseBranch is set', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], alwaysAcceptBaseBranch: true, baseBranch: 'master'})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should not allow alwaysAcceptBaseBranch option when baseBranch is not set', function() {
      return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], alwaysAcceptBaseBranch: true})
        .catch(function(err) {
          expect(err.message).to.equal('"alwaysAcceptBaseBranch" missing required peer "baseBranch"');
        });
    });

    describe('validate.failureExitCode', function() {
      it('should allow setting to 0', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], failureExitCode: 0})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should error when setting above 255', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], failureExitCode: 256})
          .catch(function(err) {
            expect(err.message).to.equal('child "failureExitCode" fails because ["failureExitCode" must be less than or equal to 255]');
          });
      });
    });

    describe('validate.storybookBinPath', function() {
      it('should error when storybookBinPath is set without storybookVersion', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], storybookBinPath: '/path'})
          .catch(function(err) {
            expect(err.message).to.equal('"storybookBinPath" missing required peer "storybookVersion"');
          });
      });

      it('should allow setting storybookVersion to 2, 3 or 4', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], storybookVersion: 2})
          .then(function() {
            return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], storybookVersion: 3});
          })
          .then(function() {
            return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], storybookVersion: 4});
          })
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should error when setting storybookVersion to any value not 2, 3, 4, 5', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], storybookVersion: 1})
          .catch(function(err) {
            expect(err.message).to.equal('child "storybookVersion" fails because ["storybookVersion" must be one of [2, 3, 4, 5]]');
          });
      });

      it('should allow setting storybookApp to react, vue or angular', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], storybookApp: 'react'})
          .then(function() {
            return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], storybookApp: 'vue'});
          })
          .then(function() {
            return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], storybookApp: 'angular'});
          })
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should error when setting storybookApp to any value not react, vue or angular', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], storybookApp: 'other'})
          .catch(function(err) {
            expect(err.message).to.equal('child "storybookApp" fails because ["storybookApp" must be one of [react, vue, angular, html]]');
          });
      });

      it('should allow when both storybookBinPath and storybookVersion', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], storybookVersion: 3, storybookBinPath: '/path'})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });
    });

    describe('validate.browsers', function() {
      it('should error when browsers is empty', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], browsers: []})
          .catch(function(err) {
            expect(err.message).to.equal('child "browsers" fails because ["browsers" must contain at least 1 items]');
          });
      });

      it('should allow browsers with sauce config', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], browsers: [{ browserName: 'safari', version: '11.0' }], sauce: { username: 'user', accessKey: 'key', maxConcurrent: 10 }})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow browsers with browserStack config', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], browsers: [{ browserName: 'safari', version: '11.0' }], browserStack: { username: 'user', accessKey: 'key', maxConcurrent: 10 }})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should error when both sauce and browserStack options are present', function() {
        return validate.storybookConfig({apiKey: 'key', projectRepo: 'repo', storybookConfigDir: '.storybook', storybookPort: 6006, storybookPreview: '/preview.html', storybook: [], browsers: [{ browserName: 'safari', version: '11.0' }], sauce: { username: 'user', accessKey: 'key' }, browserStack: { username: 'user', accessKey: 'key' }})
          .catch(function(err) {
            expect(err.message).to.equal('"sauce" conflict with forbidden peer "browserStack"');
          });
      });
    });

  });
});
