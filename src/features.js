const path = require('path');
const fs = require('fs');
var child = require('child_process');
var semver = require('semver');

//  Return a list of features per [storybook doc](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#using-the-v7-store)
//  This is configured within the site under test main.js
//
const getStorybookFeatures = function() {
  // get the project root
  const siteUnderTest = path.resolve('.');
  if (!siteUnderTest) {
    // TODO: consider upgrade these to exceptions past Alpha pending varied integration feedback
    console.warn('screener-storybook Could not determine the location of the site under test, necessary to locate Storybook features');
    return {};
  }

  const dotStorybookPath = path.join(siteUnderTest, '.storybook');
  if (!fs.existsSync(dotStorybookPath)) {
    console.warn('screener-storybook .storybook not found, necessary to locate Storybook features');
    return {};
  }

  // main.js was added in 5.3
  // https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#to-mainjs-configuration
  // features are within `.storybook/main.js`
  const storybookMainPath = path.join(dotStorybookPath, 'main.js');
  if (!fs.existsSync(storybookMainPath)) {
    console.warn('screener-storybook .storybook/main.js not found');
    return {};
  }

  const storybookMain = require(storybookMainPath);
  if (!storybookMain) {
    console.warn('screener-storybook Could not load .storybook/main.js');
    return {};
  }

  // main.js/framework added in 6.4 as optional, mandatory in 7.0
  // https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#framework-field-mandatory
  const frameworkUnderTest = storybookMain.framework;
  if (frameworkUnderTest) {
    console.info('screener-storybook Found framework', frameworkUnderTest, 'configured in main.js');
  }

  const usesFeaturedServer = (
    (storybookMain.features && storybookMain.features.storyStoreV7) || //Automatically fallback to stories align
    isStorybookFeaturedServer()
  );
  if (!usesFeaturedServer) {
    console.info('screener-storybook No featured server detected, using legacy path');
    return {};
  }

  const features = storybookMain.features;
  return {
    framework: frameworkUnderTest,
    features: features,
    siteUnderTestPath: siteUnderTest,
    dotStorybookPath: dotStorybookPath,
    mainjs: storybookMainPath,
  };
};

const isEmpty = function isEmpty(obj) {
  return !Object.keys(obj).length;
};

// TODO: would be nice to cache this execution response
// so we don't end calling `npm ls` multiple times
const getStorybookVersion = function getStorybookVersion() {
  const storybookVersionRegex = /(@storybook\/[^@]+)@(\S+)/;
  try {
    let lines = child.execSync('npm ls').toString('utf8');
    //remove initial line
    if (lines && lines.length > 0) {
      lines = lines.split('\n');
      lines.shift();
    }
    //attempt to find storybook
    const storybookPackage = lines.find((line) => {
      const match = storybookVersionRegex.exec(line);
      return (match && semver.clean(match[2]));
    });
    //Found storybook dep?
    if (!storybookPackage) return null;
    const match = storybookVersionRegex.exec(storybookPackage);
    //Return version if valid
    if (match[2]) return match[2];
  } catch (e) {
    console.info('screener-storybook Exception while attempting to retrieve storybook dependecy version', e.toString());
  }
  return null;
};

const isStorybookFeaturedServer = function () {
  const storybookVersion = getStorybookVersion();
  return (storybookVersion && semver.gt(storybookVersion, '6.4.0'));
};

module.exports = {
  getStorybookFeatures,
  isEmpty,
  getStorybookVersion,
  isStorybookFeaturedServer
};
