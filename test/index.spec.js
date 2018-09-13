var expect = require('chai').expect;
var rewire = require('rewire');
var ScreenerStorybook = rewire('../src/index');

describe('screener-storybook/src/index', function() {
  describe('ScreenerStorybook.getStorybook', function() {
    it('should remove invalid kind format from storybook array', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(options, callback) {
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
      return ScreenerStorybook.getStorybook({})
        .then(function(storybook) {
          expect(storybook).to.deep.equal([]);
        });
    });

    it('should remove invalid story format from storybook array', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(options, callback) {
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
      return ScreenerStorybook.getStorybook({})
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

    it('should extract steps from React storybook array', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(options, callback) {
          var storybookData = [
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  render: function() {
                    return {
                      props: {
                        isScreenerComponent: true,
                        steps: [
                          {
                            type: 'clickElement'
                          },
                          {
                            type: 'saveScreenshot'
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
      return ScreenerStorybook.getStorybook({})
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

    it('should extract steps from React props with story function', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(options, callback) {
          var storybookData = [
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  render: function() {
                    return {
                      props: {
                        story: function() {
                          return {
                            props: {
                              isScreenerComponent: true,
                              steps: [
                                {
                                  type: 'clickElement'
                                },
                                {
                                  type: 'saveScreenshot'
                                }
                              ]
                            }
                          };
                        }
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
      return ScreenerStorybook.getStorybook({})
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

    it('should extract steps from React props with storyFn function', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(options, callback) {
          var storybookData = [
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  render: function() {
                    return {
                      props: {
                        storyFn: function() {
                          return {
                            props: {
                              isScreenerComponent: true,
                              steps: [
                                {
                                  type: 'clickElement'
                                },
                                {
                                  type: 'saveScreenshot'
                                }
                              ]
                            }
                          };
                        }
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
      return ScreenerStorybook.getStorybook({})
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

    it('should extract nested initialContent steps from React storybook array', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(options, callback) {
          var storybookData = [
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  render: function() {
                    return {
                      props: {
                        initialContent: {
                          props: {
                            children: {
                              props: {
                                isScreenerComponent: true,
                                steps: [
                                  {
                                    type: 'clickElement'
                                  },
                                  {
                                    type: 'saveScreenshot',
                                  }
                                ]
                              }
                            }
                          }
                        }
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
      return ScreenerStorybook.getStorybook({})
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

    it('should extract multiple children steps from React storybook array', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(options, callback) {
          var storybookData = [
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  render: function() {
                    return {
                      props: {
                        children: [
                          {props: {}},
                          {
                            props: {
                              children: {
                                props: {
                                  isScreenerComponent: true,
                                  steps: [
                                    {
                                      type: 'clickElement'
                                    },
                                    {
                                      type: 'saveScreenshot',
                                    }
                                  ]
                                }
                              }
                            }
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
      return ScreenerStorybook.getStorybook({})
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

    it('should extract top-most steps from React storybook array', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(options, callback) {
          var storybookData = [
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  render: function() {
                    return {
                      props: {
                        children: {
                          props: {
                            isScreenerComponent: true,
                            steps: [],
                            children: {
                              props: {
                                isScreenerComponent: true,
                                steps: [
                                  {
                                    type: 'clickElement'
                                  },
                                  {
                                    type: 'saveScreenshot',
                                  }
                                ]
                              }
                            }
                          }
                        }
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
      return ScreenerStorybook.getStorybook({})
        .then(function(storybook) {
          expect(storybook).to.deep.equal([
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  steps: []
                }
              ]
            }
          ]);
        });
    });

    it('should extract nested children steps from React storybook array', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(options, callback) {
          var storybookData = [
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  render: function() {
                    return {
                      props: {
                        children: {
                          props: {
                            children: {
                              props: {
                                isScreenerComponent: true,
                                steps: [
                                  {
                                    type: 'clickElement'
                                  },
                                  {
                                    type: 'saveScreenshot',
                                  }
                                ]
                              }
                            }
                          }
                        }
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
      return ScreenerStorybook.getStorybook({})
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

    it('should extract steps from Vue or Angular storybook array', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(options, callback) {
          var storybookData = [
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  render: function() {
                    return {
                      steps: [
                        {
                          type: 'clickElement'
                        },
                        {
                          type: 'saveScreenshot',
                        }
                      ]
                    };
                  }
                }
              ]
            }
          ];
          callback(null, storybookData);
        }
      });
      return ScreenerStorybook.getStorybook({})
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

    it('should extract steps from Vue decorator with render method', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(options, callback) {
          var storybookData = [
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  render: function() {
                    return {
                      render: function(fn) {
                        fn();
                        return {
                          steps: [
                            {
                              type: 'clickElement'
                            },
                            {
                              type: 'saveScreenshot',
                            }
                          ]
                        };
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
      return ScreenerStorybook.getStorybook({})
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

    it('should extract steps from Vue decorator with components.story', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(options, callback) {
          var storybookData = [
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  render: function() {
                    return {
                      components: {
                        story: {
                          render: function(fn) {
                            fn();
                            return {
                              steps: [
                                {
                                  type: 'clickElement'
                                },
                                {
                                  type: 'saveScreenshot',
                                }
                              ]
                            };
                          }
                        }
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
      return ScreenerStorybook.getStorybook({})
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

    it('should handle exceptions when executing render method', function() {
      ScreenerStorybook.__set__('Storybook', {
        server: function() {},
        get: function(options, callback) {
          var storybookData = [
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default',
                  render: function() {
                    throw new Error('this is a test');
                  }
                }
              ]
            }
          ];
          callback(null, storybookData);
        }
      });
      return ScreenerStorybook.getStorybook({debug: true})
        .then(function(storybook) {
          expect(storybook).to.deep.equal([
            {
              kind: 'Component1',
              stories: [
                {
                  name: 'default'
                }
              ]
            }
          ]);
        });
    });

  });
});
