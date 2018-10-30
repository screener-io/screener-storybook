# Screener-Storybook [![Build Status](https://circleci.com/gh/screener-io/screener-storybook/tree/master.svg?style=shield)](https://circleci.com/gh/screener-io/screener-storybook)

Automated Visual Testing for [Storybook](https://storybook.js.org) (React, Vue or Angular) using [Screener.io](https://screener.io).

Screener-Storybook will use your existing Storybook stories as visual test cases, and run them against [Screener's](https://screener.io) automated visual testing service. Get visual regression tests across your React, Vue or Angular components with no additional coding!

### Installation

1. Go to <a href="https://screener.io/v2/new" target="_blank">https://screener.io/v2/new</a>
2. Follow the steps in the wizard to setup a New Project

### Run

When your project is setup, you can run a test with the following command:

```
$ npm run test-storybook
```

### Docs

- [Testing Interactions](#testing-interactions)
- [Testing Responsive Designs](#testing-responsive)
- [Cross Browser Testing](#cross-browser-testing)
- [Additional Configuration Options](#config-options)

---

### <a name="testing-interactions"></a>Testing Interactions

To test interactions, you can add `steps` to your existing Storybook stories. Each `step` is an instruction to interact with the component. This is useful for clicking buttons, filling out forms, and getting your components into the proper visual state to test. This also keeps your stories and interaction test code in the same place.

##### With React

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

##### With Vue

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

##### With Angular

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
- `snapshot(name, [options])`: this will capture a visual snapshot.
     - Optional `options` param can contain a `cropTo` field:
     ```javascript
     .snapshot('open', {cropTo: '.selector'})
     ```
- `hover(selector)`: this will move the mouse over the first element matching the provided css selector.
- `mouseDown(selector)`: this will press and hold the mouse button over the first element matching the provided css selector.
- `mouseUp(selector)`: this will release the mouse button. `selector` is optional.
- `focus(selector)`: this will set cursor focus on the first element matching the provided css selector.
- `setValue(selector, value)`: this will set the value of the input field matching the provided css selector.
- `keys(selector, keys)`: this will send the provided keys to the first element matching the provided css selector.
- `executeScript(code)`: this executes custom JS code against the client browser the test is running in.  The `code` parameter is a **string**.
- `ignore(selector)`: this ignores all elements matching the provided css selector(s).
- `wait(ms)`: this will pause execution for the specified number of ms.
- `wait(selector)`: this will wait until the element matching the provided css selector is present.
- `cssAnimations(isEnabled)`: this will override the global cssAnimations option for the current UI state. Set to `true` to enable CSS Animations, and set to `false` to disable.
- `rtl()`: this will set the current UI state to right-to-left direction.
- `ltr()`: this will set the current UI state to left-to-right direction.
- `end()`: this will return the steps to be run.

**Note:** When adding `Steps` using the fluent API, you **must** end the method chain with `end()`.


### <a name="testing-responsive"></a>Testing Responsive Designs

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

**Available Devices**

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

```
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```


### <a name="cross-browser-testing"></a>Cross Browser Testing

**Overview**

For Cross Browser Testing, Screener provides cloud browsers and device emulators. The following browsers are available:

- Chrome
- Firefox
- Internet Explorer 11

To test against additional browsers, Screener provides integrations with [Sauce Labs](https://saucelabs.com/) and [BrowserStack](https://browserstack.com) to provide access to Safari and Edge browsers. For more information, view the [Sauce Labs Integration](https://screener.io/v2/docs/sauce) or [BrowserStack Integration](https://screener.io/v2/docs/browserstack) documentation.

Cross Browser Testing is available through Screener's Perform plan. By default, Screener runs tests against the Chrome browser.

**Adding Browsers**

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

**Supported Browsers**

| browserName  | version | |
| ------------- | ------------- | ------------- |
| chrome | *-do not set-* | |
| firefox | *-do not set-* | |
| internet explorer | 11 | |
| microsoftedge | 17.17134 | requires [Sauce Labs](https://screener.io/v2/docs/sauce) or [BrowserStack](https://screener.io/v2/docs/browserstack) Integration |
| safari | 11.1 | requires [Sauce Labs](https://screener.io/v2/docs/sauce) or [BrowserStack](https://screener.io/v2/docs/browserstack) Integration |




### <a name="config-options"></a>Additional Configuration Options

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
- **includeRules:** Optional array of RegExp expressions to filter states by. Rules are matched against state name. All matching states will be kept.
    - Example:
    ```javascript
    includeRules: [
      /^Component/
    ]
    ```
- **excludeRules:** Optional array of RegExp expressions to filter states by. Rules are matched against state name. All matching states will be removed.
    - Example:
    ```javascript
    excludeRules: [
      /^Component/
    ]
    ```
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
      maxConcurrent: 10 // optional available concurrency you have from Sauce Labs
    }
    ```
- **vsts:** Optional configuration for integrating with Visual Studio Team Services.
    - Example:
    ```javascript
    vsts: {
      instance: 'myproject.visualstudio.com'
    }
    ```
