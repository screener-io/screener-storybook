// This is needed for testing static builds  
// More info: https://github.com/screener-io/screener-storybook#testing-with-static-storybook-app
if (typeof window === 'object') {
  window.__screener_storybook__ = require('@storybook/react').getStorybook;
}
