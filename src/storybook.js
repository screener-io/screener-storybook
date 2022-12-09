var storybookCheck = require('./check');
var path = require('path');
var { isStorybookFeaturedServer, getStorybookVersion } = require('./features');
// var getStorySteps = require('./scripts/story-steps');

var fs = require('fs');
var os = require('os');
var getPort = require('get-port');
var spawn = require('child_process').spawn;
var request = require('request');
var requestRetry = require('requestretry');
var puppeteer = require('puppeteer');
var colors = require('colors/safe');
var semver = require('semver');
var express = require('express');
var { Server } = require('http');

var storybookObj;
/*
 * valid ports that are supported by sauce connect, please refer here:
 * https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy+FAQS#SauceConnectProxyFAQs-CanIAccessApplicationsonlocalhost?
 * notice that we kicked out 5555 and 8080 for safe
*/
const VALIDPORTS = [
  2000, 2001, 2020, 2109, 2222, 2310, 3000,
  3001, 3010, 3030, 3210, 3333, 4000, 4001,
  4201, 4040, 4321, 4502, 4503, 4567, 5000,
  5001, 5002, 5050, 5432, 6000, 6001, 6060,
  6666, 6543, 7000, 7070, 7774, 7777, 8000,
  8001, 8003, 8031, 8081, 8443, 8765, 8777,
  8888, 9000, 9001, 9031, 9080, 9081, 9090,
  9191, 9876, 9877, 9999, 49221, 55001
];

/*
 * Credit to storybookjs for a slick way to pull the stories across versions without an interim hook.
 * https://github.com/storybookjs/storybook/blob/350279a9960ca293b81c7ad207c0c8a2f0bcdeac/lib/cli/src/extract.ts#L16-L16
 *
 * Note: this differs from screener-storybook versions prior to 0.25 which dynamically injected a hook into the
 * preview.js.
 */
const getStorybook = async function (page) {
  // asks storybook to extract preview (mdx?) and story store
  await page.waitForFunction(`
    (window.__STORYBOOK_PREVIEW__ && window.__STORYBOOK_PREVIEW__.extract && window.__STORYBOOK_PREVIEW__.extract()) ||
    (window.__STORYBOOK_STORY_STORE__ && window.__STORYBOOK_STORY_STORE__.extract && window.__STORYBOOK_STORY_STORE__.extract())
  `);
  // Get stories steps by extracting content from store, aligning stories and pulling steps from it
  // -- This must be done at a single context to avoid puppeteer to serialize object instances
  // and avoid loosing context sensitive functions -- This was hook was doing my mistake?
  const stepsScript = fs.readFileSync(__dirname + '/scripts/story-steps.js', 'utf8');
  const storySteps = await page.evaluate(stepsScript);
  //
  return storySteps;
};

var storybookReady = function(port, options, callback) {
  // wait for storybook server to be ready
  setTimeout(function() {
    var baseUrl = 'http://localhost:' + port;
    var retryStrategy = function(err, response) {
      var networkError = requestRetry.RetryStrategies.HTTPOrNetworkError(err, response);
      var statusCode = response && response.statusCode;
      if (options && options.debug) {
        console.log('DEBUG: GET', baseUrl, networkError, statusCode);
      }
      return networkError || statusCode === 404;
    };
    requestRetry.get(baseUrl + '/', {retryStrategy: retryStrategy, maxAttempts: 60}, function(err, response, body) {
      if (err) return callback(err);
      if (response.statusCode != 200 || !body) {
        return callback(new Error('Error loading Storybook'));
      }
      var previewRoute = '/preview.html';
      // confirm existence of preview.html, or fallback to iframe.html
      request.get(baseUrl + previewRoute, function(err, response) {
        if (err) return callback(err);
        if (response.statusCode != 200) {
          previewRoute = '/iframe.html';
        }
        if (options && options.debug) {
          console.log('DEBUG: previewRoute', previewRoute);
        }
        // get storybook obj with puppeteer
        var launchOptions = {headless: true};
        // launch without sandbox in container-based and windows server environments
        // https://docs.travis-ci.com/user/chrome#Sandboxing
        if (os.platform() === 'linux' || os.platform() === 'win32') {
          launchOptions.args = ['--no-sandbox'];
        }
        var browser, page;
        var done = function() {
          callback(null, {port: port, preview: previewRoute});
        };
        puppeteer.launch(launchOptions)
          .then(function(_browser) {
            browser = _browser;
            return browser.newPage();
          })
          .then(function(_page) {
            page = _page;
            if (options && options.debug) {
              console.log('DEBUG: GET', baseUrl + previewRoute);
            }
            return page.goto(baseUrl + previewRoute, {timeout: 300000});
          })
          .then(function() {
            return getStorybook(page, 0, options);
          })
          .then(function(result) {
            storybookObj = result;
            return browser.close();
          })
          .then(done)
          .catch(function(ex) {
            if (options && options.debug) {
              console.error(ex);
            }
            if (browser) {
              return browser.close().then(done);
            }
            done();
          });
      });
    });
  }, 3*1000);
};

var staticServer = exports.staticServer = function(config, options, callback) {
  // confirm static folder exists
  var storybookBuildPath = path.resolve(process.cwd(), config.storybookStaticBuildDir);
  if (!fs.existsSync(storybookBuildPath)) {
    return callback(new Error('Error: \'storybookStaticBuildDir\' directory not found.'));
  }
  console.log('Use Static Storybook Build:\n' + storybookBuildPath);
  // find free port
  getPort({ port: VALIDPORTS }).then(function(port) {
    var expressApp = express();
    var fileServer = Server(expressApp);
    expressApp.use(express.static(storybookBuildPath, {maxAge: 900}));
    fileServer.listen(port, '127.0.0.1', function(err) {
      if (err) {
        return callback(new Error('Error starting static server to ' + storybookBuildPath + ': ' + err.toString()));
      }
      console.log('Started server: http://localhost:' + port);
      storybookReady(port, options, callback);
    });
  }).catch(callback);
};

const isWindowsPlatform = function() {
  return /^win/.test(process.platform);
};

//  Pre SB6.4 approach of user defined config dir, package interrogation
//
const launchLegacyServer = function(config, options, port, callback) {
  if (!config || !config.storybookConfigDir) {
    return callback(new Error('Error: \'storybookConfigDir\' not found in config file.'));
  }

  // start Storybook dev server
  var binPath = path.resolve(process.cwd(), 'node_modules/.bin');
  if (config.storybookBinPath) {
    binPath = config.storybookBinPath;
    console.log('Use custom storybook bin path: ' + binPath);
  }
  var bin = path.resolve(binPath, 'start-storybook');
  var isWin = isWindowsPlatform();
  if (isWin) {
    bin += '.cmd';
  }
  // Important -- we removed '--no-manager-cache' from the first alpha release
  // due to the missing support of this value on V5 and it seems unneeded for a 
  // successful stories extraction. Would be nice to do some investigation on this.
  var args = ['--port', port, '--config-dir', config.storybookConfigDir];
  // TODO: this looks like dead code or undocumented legacy?  see conflicting `storybookStaticBuildDir`
  if (config.storybookStaticDir) {
    args.push('--static-dir');
    args.push(config.storybookStaticDir);
  }
  // support storybook v4+ `--ci` flag starting from v4.0.0-alpha.23
  const storybookVersion = getStorybookVersion();
  if (storybookVersion && semver.gte(storybookVersion, '4.0.0') && semver.gt(storybookVersion, '4.0.0-alpha.22')) {
    args.push('--ci');
  }
  console.log('\nStarting Storybook server...');
  console.log('>', 'start-storybook', args.join(' '), '\n\nPlease wait. Starting Storybook may take a minute...\n');
  var serverProcess = spawn(bin, args, {detached: !isWin});
  if (options && (options.debug || options.serverOnly)) {
    serverProcess.stdout.on('data', function(data) { console.log(data.toString('utf8').trim()); });
    serverProcess.stderr.on('data', function(data) { console.error(data.toString('utf8').trim()); });
  }

  // clean-up all child processes when this process is terminated
  process.on('exit', function() {
    if (!isWin) {
      process.kill(-serverProcess.pid);
    }
  });
  process.on('SIGINT', function() {
    process.exit();
  });
  process.on('uncaughtException', function(err) {
    console.error(err);
    process.exit(1);
  });

  storybookReady(port, options, function(err, result) {
    callback(null, result);
  });
};

const launchFeatureServer = function(screenerConfig, options, port, storybookConfig, callback) {
  const isWin = isWindowsPlatform();

  // start Storybook dev server
  const binPath = path.resolve(process.cwd(), 'node_modules/.bin');
  let bin = path.resolve(binPath, 'start-storybook');
  if (isWin) {
    bin += '.cmd';
  }
  console.info('screener-storybook using SB server startup bin', bin);

  // --ci mode (skip interactive prompts, don't open browser) https://storybook.js.org/docs/react/api/cli-options
  let args = ['--port', port, '--ci', '--config-dir', storybookConfig.dotStorybookPath];

  console.info('\nStarting Storybook server...');
  console.info('>', 'start-storybook', args.join(' '), '\n\nPlease wait. Starting Storybook may take a minute...\n');
  const serverProcess = spawn(bin, args, {detached: !isWin});
  if (options && (options.debug || options.serverOnly)) {
    serverProcess.stdout.on('data', function(data) { console.log(data.toString('utf8').trim()); });
    serverProcess.stderr.on('data', function(data) { console.error(data.toString('utf8').trim()); });
  }

  // clean-up all child processes when this process is terminated
  process.on('exit', function() {
    if (!isWin) {
      process.kill(-serverProcess.pid);
    }
  });
  process.on('SIGINT', function() {
    process.exit();
  });
  process.on('uncaughtException', function(err) {
    console.error(err);
    process.exit(1);
  });

  storybookReady(port, options, function(err, result) {
    callback(null, result);
  });
};

exports.server = function(screenerConfig, options, callback) {
  console.info('screener-storybook/storybook.js server sees screener config', screenerConfig);
  console.info('screener-storybook/storybook.js server sees options', options);

  // screener may be configured to use the static build
  if (screenerConfig.storybookStaticBuildDir) {
    return staticServer(screenerConfig, options, callback);
  }

  // check versions and features
  try {
    // find free port and launch the server from it's binary
    getPort({ port: VALIDPORTS }).then(function(port) {
      console.info('screener-storybook launching as server on port', port);

      const storybookConfig = storybookCheck();

      //Determine server behaviour
      const usesFeaturedServer = (
        (storybookConfig.features && storybookConfig.features.storyStoreV7) || //Automatically fallback to feature server
        isStorybookFeaturedServer()
      );

      if (!usesFeaturedServer) {  // SB6.3-
        return launchLegacyServer(screenerConfig, options, port, callback);
      }

      //  This is our normal course since SB 6.4, whereby a main.js may indicate
      //  a framework being used by the site under test, and features (some optional)
      //  and some default are specified.

      launchFeatureServer(screenerConfig, options, port, storybookConfig, callback);
    }).catch(callback);

  } catch(ex) {
    return callback(ex);
  }
};

exports.get = function(options) {
  if (!storybookObj) {
    console.error(colors.red('Error getting Storybook object'));
    if (options && options.debug) {
      console.error(colors.red('Please send debug output to help@saucelabs.com'));
    } else {
      console.error(colors.red('Please re-run with --debug flag, and send debug output to help@saucelabs.com'));
    }
    throw new Error('Storybook object not found');
  }
  return storybookObj;
};
