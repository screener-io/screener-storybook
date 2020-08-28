var expect = require('chai').expect;
var rewire = require('rewire');
var Storybook = rewire('../../src/storybook');

describe('screener-storybook/src/storybook', function() {

  describe('setStorybookConfig', function() {

    var storybookVersion = {major: 5, full: '5.3.0'};

    it('should inject code into config file', function() {
      Storybook.__set__('fs', {
        existsSync: () => true,
        readFileSync: () => '${code}${app}',
        writeFileSync: (configPath, code) => {
          expect(code).to.equal('${code}${app}react');
        }
      });
      var configObj = Storybook.setStorybookConfig('react', storybookVersion, '.storybook');
      expect(configObj.body).to.equal('${code}${app}');
      expect(configObj.isNewFile).to.equal(false);
      expect(configObj.path).to.include('/config.js');
    });

    it('should error when config file not found', function() {
      Storybook.__set__('fs', {
        existsSync: () => false
      });
      try {
        Storybook.setStorybookConfig('react', {major: 3}, '.storybook');
        throw new Error('should not be here');
      } catch(ex) {
        expect(ex.toString()).to.include('Storybook config file not found');
      }
    });

    it('should update preview file when no config file', function() {
      Storybook.__set__('fs', {
        existsSync: (filepath) => {
          return (filepath.includes('/preview.js')) ? true : false;
        },
        readFileSync: () => '${code}${app}',
        writeFileSync: (configPath, code) => {
          expect(code).to.equal('${code}${app}react');
        }
      });
      var configObj = Storybook.setStorybookConfig('react', storybookVersion, '.storybook');
      expect(configObj.body).to.equal('${code}${app}');
      expect(configObj.isNewFile).to.equal(false);
      expect(configObj.path).to.include('/preview.js');
    });

    it('should create and update preview file', function() {
      Storybook.__set__('fs', {
        existsSync: () => false,
        readFileSync: () => '',
        writeFileSync: () => true
      });
      var configObj = Storybook.setStorybookConfig('react', storybookVersion, '.storybook');
      expect(configObj.body).to.equal('');
      expect(configObj.isNewFile).to.equal(true);
      expect(configObj.path).to.include('/preview.js');
    });
  });

  describe('resetStorybookConfig', function() {

    var configObj = {
      path: 'path',
      body: 'body',
      isNewFile: false
    };

    it('should update config file to body content when file is different', function() {
      var writeBody;
      Storybook.__set__('fs', {
        existsSync: () => true,
        readFileSync: () => 'something else',
        writeFileSync: (configPath, body) => {
          writeBody = body;
        }
      });
      Storybook.resetStorybookConfig(configObj);
      expect(writeBody).to.equal('body');
    });

    it('should not write to config file when same as body content', function() {
      Storybook.__set__('fs', {
        existsSync: () => true,
        readFileSync: () => 'body',
        writeFileSync: () => {
          throw new Error('should not be here');
        }
      });
      Storybook.resetStorybookConfig(configObj);
    });

    it('should remove file when isNewFile and allowRemoveFile', function() {
      var unlinkCalled = false;
      Storybook.__set__('fs', {
        existsSync: () => true,
        unlinkSync: () => {
          unlinkCalled = true;
        },
        readFileSync: () => {
          throw new Error('should not be here');
        },
        writeFileSync: () => {
          throw new Error('should not be here');
        }
      });
      Storybook.resetStorybookConfig({isNewFile: true}, true);
      expect(unlinkCalled).to.equal(true);
    });
  });

});
