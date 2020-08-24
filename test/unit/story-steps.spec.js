var expect = require('chai').expect;
var getStorySteps = require('../../src/scripts/story-steps');

describe('screener-storybook/src/scripts/story-steps', function() {
  describe('getStorySteps', function() {
    it('should remove invalid kind format from storybook array', function() {
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([]);
    });

    it('should remove invalid story format from storybook array', function() {
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([
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

    it('should extract steps from React storybook array', function() {
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([
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

    it('should extract steps from React props with story function', function() {
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([
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

    it('should extract steps from React props with storyFn function', function() {
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([
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

    it('should extract steps from React children with type function', function() {
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
                          props: {},
                          type: function() {
                            return {
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
                            };
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([
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

    it('should extract nested initialContent steps from React storybook array', function() {
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([
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

    it('should extract multiple children steps from React storybook array', function() {
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([
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

    it('should extract top-most steps from React storybook array', function() {
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([
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

    it('should extract nested children steps from React storybook array', function() {
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([
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

    it('should extract steps from Vue or Angular storybook array', function() {
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([
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

    it('should extract steps from Vue decorator with render method', function() {
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([
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

    it('should extract steps from Vue decorator with components.story', function() {
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([
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

    it('should handle exceptions when executing render method', function() {
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
      var result = getStorySteps(storybookData);
      expect(result).to.deep.equal([
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
