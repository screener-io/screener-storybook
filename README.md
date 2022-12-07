# Screener-Storybook

Automated Visual Testing for [Storybook](https://storybook.js.org) (React, Vue, Angular or HTML) using [Screener.io](https://screener.io).

Screener-Storybook will use your existing Storybook stories as visual test cases, and run them against [Screener's](https://screener.io) automated visual testing service. Get visual regression tests across your React, Vue, Angular or HTML components with no additional coding!

## StoryStoreV7 Support

Currently available as `alpha` releases only, version 1.0.0 provides support for Storybook 6.4+ with the `storyStoreV7`
[feature enabled](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#story-store-v7).

It is an Alpha for feedback and to un-block some users experiencing pre-V7 drift where despite not having
storyStoreV7 enabled the internals seem to be configured as if it is enabled.

```
npm install screener-storybook@alpha --save-dev
```

### Migration

**Please remove the now legacy** `__screener_storybook__` from any `preview.js|ts` file including static builds.

It looks like this, please delete it:
```javascript
if (typeof window === 'object') {
  window.__screener_storybook__ = require('@storybook/react').getStorybook;
}
```

### What's Working, What's Changed

Initial states of all stories are present in the Visual UI including MDX.  If you are missing any stories please
let us know immediately.  This does not include missing states due to Screener Steps, this we are aware
of and are working on a resolution.

**Hookless**

We've removed the requirement of the prior preview.js hook function.  This should reduce brittleness, resolve several
open issues, and provide simplicity during runtime where we no longer dynamically alter your `preview.js|ts`.

**Puppeteer Upgraded from v1 to v18**

Puppeteer v19 caused instability in our CI matrices, so we stepped down to v18.  As it is a major (very) upgrade if you
run into problems please let us know.

We fortunately have not experienced any visual regressions due to this upgrade, so far but suspect edge cases due to
specific Chromium features.  Please share any regressions you might find with us, or simply accept them via the Visual UI.

### Compatibility

There is a good deal of legacy compatibility in 1.0, we're testing this routinely in a CI matrix that includes:

* Storybook versions 5, 6
* `storyStoreV7` enabled / disabled
* dependency combinations including Storybook as a peer dependency

Given the severity of internal changes we chose a major version bump, though tried to keep the legacy path intact.

### Known Issues

Screener Steps are currently broken in the Alpha, so any states beyond the initial will not be present in the Visual UI.

We will consider automatically removing the `__screener_storybook__` hooks or providing a migration tool for this closer to release.

Documentation updates to follow closer to release.

___

## Installation

1. Go to [https://screener.io/v2/new](https://screener.io/v2/new)
2. Follow the steps in the wizard to setup a New Project

## Run

When your project is setup, you can run a test with the following command:

```bash
npm run test-storybook
```

## Docs

- [Testing Interactions](#testing-interactions)
- [Testing Responsive Designs](#testing-responsive-designs)
- [Cross Browser Testing](#cross-browser-testing)
- [Testing with Static Storybook App](#testing-with-static-storybook-app)
- [Additional Configuration Options](#additional-configuration-options)

---

### Testing Interactions

To test interactions, you can add `steps` to your existing Storybook stories. Each `step` is an instruction to interact with the component. This is useful for clicking buttons, filling out forms, and getting your components into the proper visual state to test. This also keeps your stories and interaction test code in the same place.

#### With React

To add `steps` to a React story, wrap your component within a `Screener` component, and pass it a `steps` prop. The `steps` can then be generated using our fluent API below.

Here is an example:

```javascript
import Screener, {Steps} from 'screener-storybook/src/screener';

storiesOf('MyComponent', module)
  .add('default', () => (
    <Screener steps={new Steps()
      .click('.selector')
      .snapshot('name')
      .end()
    }>
      <MyComponent />
    </Screener>
  ));
```

#### With Vue

To add `steps` to a Vue story, add a `steps` prop to the story object being returned. The `steps` can then be generated using our fluent API below.

Here is an example:

```javascript
import Steps from 'screener-runner/src/steps';

storiesOf('MyComponent', module)
  .add('default', () => ({
    render: h => h(MyComponent),
    steps: new Steps()
      .click('.selector')
        .snapshot('name')
        .end()
  }));
```

#### With Angular

To add `steps` to an Angular story, add a `steps` prop to the story object being returned. The `steps` can then be generated using our fluent API below.

Here is an example:

```javascript
import * as Steps from 'screener-runner/src/steps';

storiesOf('MyComponent', module)
  .add('default', () => ({
    component: MyComponent,
    props: {},
    steps: new Steps()
      .click('.selector')
        .snapshot('name')
        .end()
  }));
```

#### Steps

The following step methods are currently available. Methods with selectors have built-in waits to simplify test flow creation:

- `click(selector)`: this will click on the first element matching the provided css selector.
  - When selector is not found, will automatically retry. Default timeout is 15 seconds.
  - Optional `options` param can contain a `maxTime` option (in ms):

    ```javascript
    .click('.selector', {maxTime: 30000})
    ```

- `snapshot(name, [options])`: this will capture a visual snapshot.
  - Optional `options` param can contain a `cropTo` field:

    ```javascript
    .snapshot('open', {cropTo: '.selector'})
    ```

- `hover(selector)`: this will move the mouse over the first element matching the provided css selector.
- `mouseDown(selector)`: this will press and hold the mouse button over the first element matching the provided css selector.
- `mouseUp(selector)`: this will release the mouse button. `selector` is optional.
- `focus(selector)`: this will set cursor focus on the first element matching the provided css selector.
- `setValue(selector, value, [options])`: this will set the value of the input field matching the provided css selector.
  - Optional `options` param can contain an `isPassword` option:

    ```javascript
    .setValue('.selector', 'text', {isPassword: true})
    ```

- `clearValue(selector)`: this will clear the value of the input field matching the provided css selector.
- `keys(selector, keys)`: this will send the provided keys to the first element matching the provided css selector.
- `executeScript(code)`: this executes custom JS code against the client browser the test is running in.  The `code` parameter is a **string**.
- `ignore(selector)`: this ignores all elements matching the provided css selector(s).
- `clearIgnores()`: this resets all ignores added using the ignore(selector) step.
- `wait(ms)`: this will pause execution for the specified number of ms.
- `wait(selector)`: this will wait until the element matching the provided css selector is present. Default timeout is 60 seconds.
  - Optional `options` param can contain a `maxTime` option (in ms):

    ```javascript
    .wait('.selector', {maxTime: 90000})
    ```

- `waitForNotFound(selector)`: this will wait until the element matching the provided css selector is Not present.
- `cssAnimations(isEnabled)`: this will override the global cssAnimations option for the current UI state. Set to `true` to enable CSS Animations, and set to `false` to disable.
- `rtl()`: this will set the current UI state to right-to-left direction.
- `ltr()`: this will set the current UI state to left-to-right direction.
- `url(url)`: this will load a new url.
- `end()`: this will return the steps to be run.

**Note:** When adding `Steps` using the fluent API, you **must** end the method chain with `end()`.

### Testing Responsive Designs

To test against multiple resolutions or devices, you can add `resolutions` to your screener configuration file, with an array of resolutions.

Each resolution item in the array is either:

- A string in the format: `<width>x<height>`. Example: `1024x768`
- Or an object with Device details: `deviceName` and optional `deviceOrientation`

Here is an example:

```javascript
module.exports = {
  ...

  resolutions: [
    '1024x768',
    {
      deviceName: 'iPhone 6'
    },
    {
      deviceName: 'iPhone 6 Plus',
      deviceOrientation: 'landscape'
    }
  ]
};
```

#### Available Devices

`deviceName` can be one of the following values:

|   |  |  |  |
| ------------- | ------------- | ------------- | ------------- |
| iPad     | iPhone 4      | Galaxy S6 | Nexus 4  |
| iPad Pro | iPhone 5      | Galaxy S7 | Nexus 5  |
|          | iPhone 6      | Galaxy S8 | Nexus 5X |
|          | iPhone 6 Plus |           | Nexus 6P |
|          | iPhone 7      |           | Nexus 7  |
|          | iPhone 7 Plus |           | Nexus 10 |
|          | iPhone 8      |           |
|          | iPhone 8 Plus |           |
|          | iPhone X      |           |

**Note:** In Storybook v4.x, you need to add the `viewport` meta tag for the browser to scale the UI correctly. You can do this by creating a file called `preview-head.html` inside the Storybook config directory and adding the following:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Cross Browser Testing

#### Overview

For Cross Browser Testing, Screener provides cloud browsers and device emulators. The following browsers are available:

- Chrome
- Firefox
- Internet Explorer 11

To test against additional browsers, Screener provides integrations with [Sauce Labs](https://saucelabs.com/) to provide access to Safari and Edge browsers. For more information, view the [Sauce Labs Integration](https://screener.io/v2/docs/sauce) documentation.

Cross Browser Testing is available through Screener's Perform plan. By default, Screener runs tests against the Chrome browser.

#### Adding Browsers

To test against multiple browsers, add the `browsers` option to your `screener.config.js` file:

```javascript
// screener.config.js
module.exports = {
  ...

  browsers: [
    {
      browserName: 'chrome'
    },
    {
      browserName: 'firefox'
    },
    {
      browserName: 'internet explorer',
      version: '11'
    }
  ]
};

```

#### Supported Browsers

| browserName  | version | |
| ------------- | ------------- | ------------- |
| chrome | *-do not set-* | |
| firefox | *-do not set-* | |
| internet explorer | 11 | |
| microsoftedge | [view supported versions](https://screener.io/v2/docs/sauce) | requires [Sauce Labs](https://screener.io/v2/docs/sauce) Integration |
| safari | [view supported versions](https://screener.io/v2/docs/sauce) | requires [Sauce Labs](https://screener.io/v2/docs/sauce) Integration |

#### Sauce Connect Integration

When using Sauce Labs browsers, you have the option to use the Sauce Connect tunnel by setting the flag `launchSauceConnect: true`. When enabled, Sauce Connect will be launched and managed by this module, and assigned a unique tunnel identifier.

  ```javascript
  sauce: {
    username: 'sauce_user',
    accessKey: 'sauce_access_key',
    maxConcurrent: 10, // optional available concurrency you have from Sauce Labs
    launchSauceConnect: true // optional,
  }
  ```

##### Important Notes on Sauce Connect

- RECOMMENDATION: when using Sauce Connect with screener-storybook, it is highly recommended to run tests with a [static Storybook build](#testing-with-static-storybook-app).

- Using Sauce Connect version `4.6.2`.

- Sauce Connect Integration requires all browsers to be Sauce Labs Browsers. An error is thrown when using non-Sauce browsers.

- Logs for Sauce Connect are saved in the root of your project under `sauce-connect.log` for debugging purposes.

- A unique `tunnelIdentifier` is automatically generated for you when using the Sauce Connect Integration. An error is thrown when `tunnelIdentifier` is set manually.

- When running Sauce Connect tunnel on your localhost, please note that Sauce Connect only supports a limited set of [valid ports](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy+FAQS#SauceConnectProxyFAQs-CanIAccessApplicationsonlocalhost?). `screener-storybook` will pick one of them in the set for you.

- For additional information on Sauce Connect please refer to the [Sauce Connect FAQ](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy+FAQS) and [Sauce Connect Troubleshooting](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy+Troubleshooting) documentation.

### Testing with Static Storybook App

To run Screener against a static Storybook build, instead of starting the Storybook Dev server, follow these setup instructions:

1 Update your Storybook config file (`.storybook/config.js` or `.storybook/preview.js`), and add the following code to the end of the file:

```javascript
if (typeof window === 'object') {
  window.__screener_storybook__ = require('@storybook/react').getStorybook;
}
```

2 Re-export your Storybook project into a static web app: `npm run build-storybook`

3 Update your `screener.config.js` file, and add the `storybookStaticBuildDir` option with its value set to your static Storybook folder:

```javascript
// screener.config.js
module.exports = {
  ...

  storybookStaticBuildDir: 'storybook-static'
};
```

### Additional Configuration Options

**Note:** Screener will automatically set `build`, `branch`, and `commit` options if you are using one of the following CI tools: Jenkins, CircleCI, Travis CI, Visual Studio Team Services, Codeship, GitLab CI, Drone, Bitbucket Pipelines, Semaphore, Buildkite.

- **build:** Build number from your CI tool (see note above). Screener will auto-generate a Build number if not provided.
- **branch:** Branch name being built (see note above).
- **commit:** Commit hash of the build (see note above).
- **resolution:** Screen resolution to use. Defaults to `1024x768`
  - Accepts a string in the format: `<width>x<height>`. Example: `1024x768`
  - Or accepts an object for Device Emulation. Example:

    ```javascript
    resolution: {
      deviceName: 'iPhone 6'
    }
    ```

  - deviceOrientation option also available. Can be `portrait` or `landscape`. Defaults to `portrait`.
- **resolutions:** Array of resolutions for Responsive Design Testing. Each item in array is a `resolution`, either string or object format.
  - See "Testing Responsive Designs" above for an example
  - Note: `resolution` and `resolutions` are mutually exclusive. Only one can exist.
- **cssAnimations:** Screener disables CSS Animations by default to help ensure consistent results in your visual tests. If you do not want this, and would like to __enable__ CSS Animations, then set this option to `true`.
- **ignore:** Comma-delimited string of CSS Selectors that represent areas to be ignored. Example: `.qa-ignore-date, .qa-ignore-ad`
- **hide:** Comma-delimited string of CSS Selectors that represent areas to hide before capturing screenshots. Example: `.hide-addon-widget, .hide-ad`
- **baseBranch:** Optional branch name of your project's base branch (e.g. master). Set this option when developing using feature branches to:
  - automatically compare and accept changes when merging a feature branch into the base branch, or when rebasing a feature branch.
  - automatically pull the initial baseline of UI states for a feature branch from this base branch.
- **storybookStaticBuildDir:** Optional path to exported static Storybook app. When this is used, tests will be run against the static Storybook app only. See above section "Testing with Static Storybook App" for setup instructions.
- **includeRules:** Optional array of RegExp expressions to filter states by. Rules are matched against state name. All matching states will be kept.
  - Example:

    ```javascript
    includeRules: [
      /^Component/
    ]
    ```

  - Note: `includeRules` can be added as a property to objects in `browsers` or `resolutions` in order to filter states specifically by a browser or resolution.
- **excludeRules:** Optional array of RegExp expressions to filter states by. Rules are matched against state name. All matching states will be removed.
  - Example:

    ```javascript
    excludeRules: [
      /^Component/
    ]
    ```

  - Note: `excludeRules` can be added as a property to objects in `browsers` or `resolutions` in order to filter states specifically by a browser or resolution.
- **diffOptions:** Visual diff options to control validations.
  - Example:

    ```javascript
    diffOptions: {
      structure: true,
      layout: true,
      style: true,
      content: true,
      minLayoutPosition: 4, // Optional threshold for Layout changes. Defaults to 4 pixels.
      minLayoutDimension: 10, // Optional threshold for Layout changes. Defaults to 10 pixels.
      minShiftGraphic: 2, // Optional threshold for pixel shifts in graphics.
      compareSVGDOM: false // Pass if SVG DOM is the same. Defaults to false.
    }
    ```

- **disableDiffOnError:** Option to disable performing diff on snapshots when underlying test session(s) had an error. Defaults to false.
- **failOnNewStates:** Option to set build to failure when `new` states are found, and to disable using `new` states as a baseline. Defaults to true.
- **alwaysAcceptBaseBranch:** Option to automatically accept `new` and `changed` states in base branch. Assumes base branch should always be correct.
- **failureExitCode:** The exit code to use on failure. Defaults to 1, which will fail a CI build.
  - To NOT fail a CI build on Screener failure, set to 0. Example:

    ```javascript
    failureExitCode: 0
    ```

- **browsers:** Optional array of browsers for Cross Browser Testing. Each item in array is an object with `browserName` and `version` properties.
  - `browserName` and `version` *must* match one of the supported browsers/versions in the browser table above.
  - Example:

    ```javascript
      browsers: [
        {
          browserName: 'chrome'
        },
        {
          browserName: 'safari',
          version: '11.1'
        }
      ]
    ```

- **ieNativeEvents:** Option to enable native events in Internet Explorer browser. Defaults to false.
- **sauce:** Optional Sauce Labs credentials for Cross Browser Testing.
  - Example:

    ```javascript
    sauce: {
      username: 'sauce_user',
      accessKey: 'sauce_access_key',
      maxConcurrent: 10, // optional available concurrency you have from Sauce Labs
      extendedDebugging: true, // optional
      launchSauceConnect: true // optional, view "Sauce Connect" for more information
    }
    ```

- **vsts:** Optional configuration for integrating with Visual Studio Team Services.
  - Example:

    ```javascript
    vsts: {
      instance: 'myproject.visualstudio.com'
    }
    ```
