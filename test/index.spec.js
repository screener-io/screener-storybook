var expect = require('chai').expect;
var rewire = require('rewire');
var ScreenerStorybook = rewire('../src/index');

describe('screener-storybook/src/index', function() {
  describe('ScreenerStorybook.getStorybook', function() {
    it('should remove invalid kind format from storybook array', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(callback) {
          var storybookData = [
            'kind',
            {
              kind: '',
              stories: [{}]
            },
            {
              kind: 'Component1'
            },
            {
              kind: 'Component2',
              stories: []
            },
          ];
          callback(null, storybookData);
        }
      });
      return ScreenerStorybook.getStorybook()
        .then(function(storybook) {
          expect(storybook).to.deep.equal([]);
        });
    });

    it('should remove invalid story format from storybook array', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(callback) {
          var storybookData = [
            {
              kind: 'Component1',
              stories: ['story']
            },
            {
              kind: 'Component2',
              stories: [{}]
            },
          ];
          callback(null, storybookData);
        }
      });
      return ScreenerStorybook.getStorybook()
        .then(function(storybook) {
          expect(storybook).to.deep.equal([
            {
              kind: 'Component1',
              stories: []
            },
            {
              kind: 'Component2',
              stories: []
            }
          ]);
        });
    });

    it('should extract steps from storybook array', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(callback) {
          var storybookData = [
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  render: function() {
                    return {
                      type: {
                        name: 'Screener'
                      },
                      props: {
                        steps: [
                          {
                            type: 'clickElement'
                          },
                          {
                            type: 'saveScreenshot',
                          }
                        ]
                      }
                    };
                  }
                }
              ]
            }
          ];
          callback(null, storybookData);
        }
      });
      return ScreenerStorybook.getStorybook()
        .then(function(storybook) {
          expect(storybook).to.deep.equal([
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  steps: [
                    {
                      type: 'clickElement'
                    },
                    {
                      type: 'saveScreenshot',
                    }
                  ]
                }
              ]
            }
          ]);
        });
    });

  });
});
