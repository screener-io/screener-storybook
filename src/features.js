const path = require('path');
const fs = require('fs');

//  Return a list of features per [storybook doc](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#using-the-v7-store)
//  This is configured within the site under test main.js
//
const getStorybookFeatures = function() {
  // get the project root
  const siteUnderTest = path.resolve('.');
  if (!siteUnderTest) {
    // TODO: consider upgrade these to exceptions past Alpha pending varied integration feedback
    console.warn('Could not determine the location of the site under test, necessary to locate Storybook features');
    return {};
  }

  const dotStorybookPath = path.join(siteUnderTest, '.storybook');
  if (!fs.existsSync(dotStorybookPath)) {
    console.warn(' .storybook not found, necessary to locate Storybook features');
    return {};
  }

  // features are within `.storybook/main.js`
  const storybookMainPath = path.join(dotStorybookPath, 'main.js');
  if (!fs.existsSync(storybookMainPath)) {
    console.warn('.storybook/main.js not found');
    return {};
  }

  // TODO: check for typescript preview.ts file
  const storybookPreview = path.join(dotStorybookPath, 'preview.js');
  if (!fs.existsSync(storybookPreview)) {
    console.warn(' .storybook/preview.js not found');
    return {};
  }

  const storybookMain = require(storybookMainPath);
  if (!storybookMain) {
    console.error('Could not load .storybook/main.js');
    return {};
  }

  // main.js/framework added in 6.4, mandatory in 7.0
  // https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#framework-field-mandatory
  const frameworkUnderTest = storybookMain.framework;
  if (frameworkUnderTest) {
    console.info('Found framework', frameworkUnderTest, 'configured in main.js');
  }

  const features = storybookMain.features;
  return {
    framework: frameworkUnderTest,
    features: features,
    siteUnderTestPath: siteUnderTest,
    dotStorybookPath: dotStorybookPath,
    mainjs: storybookMainPath,
    previewSource: storybookPreview,
  };
};

const isEmpty = function isEmpty(obj) {
  return !Object.keys(obj).length;
};

module.exports = {
  getStorybookFeatures,
  isEmpty,
};