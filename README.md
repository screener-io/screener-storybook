# Screener-Storybook [![Build Status](https://circleci.com/gh/screener-io/screener-storybook/tree/master.svg?style=shield)](https://circleci.com/gh/screener-io/screener-storybook)

Automated Visual Testing for [Storybook](https://storybook.js.org) (React or Vue) using [Screener.io](https://screener.io).

Screener-Storybook will use your existing Storybook stories as visual test cases, and run them against [Screener's](https://screener.io) automated visual testing service. Get visual regression tests across your React or Vue components with no additional coding!

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
- [Additional Configuration Options](#config-options)
- [Sauce Labs Integration for Cross Browser Testing](#cross-browser-testing)

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
- `setValue(selector, value)`: this will set the value of the input field matching the provided css selector.
- `executeScript(code)`: this executes custom JS code against the client browser the test is running in.
- `ignore(selector)`: this ignores all elements matching the provided css selector(s).
- `wait(ms)`: this will pause execution for the specified number of ms.
- `wait(selector)`: this will wait until the element matching the provided css selector is present.
- `end()`: this will return the steps to be run.

**Note:** When adding `Steps` using the fluent API, you **must** end the method chain with `end()`.


### <a name="testing-responsive"></a>Testing Responsive Designs

To test against multiple resolutions or devices, you can add `resolutions` to your screener configuration file, with an array of resolutions.

Each resolution item in the array is either:

- A string in the format: `<width>x<height>`. Example: `1024x768`
- Or an object with Device details: `deviceName` and optional `deviceOrientation`

`deviceName` value can be one of: iPhone 4, iPhone 5, iPhone 6, iPhone 6 Plus, iPad, iPad Pro, Galaxy S5, Nexus 4, Nexus 5, Nexus 5X, Nexus 6P, Nexus 7, Nexus 10


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
- **initialBaselineBranch:** Optional branch name you would like to pull the initial baseline of UI states from (e.g. master).
- **includeRules:** Optional array of strings or RegExp expressions to filter states by. Rules are matched against state name. All matching states will be kept.
    - Example:
    ```javascript
    includeRules: [
      'State name',
      /^Component/
    ]
    ```
- **excludeRules:** Optional array of strings or RegExp expressions to filter states by. Rules are matched against state name. All matching states will be removed.
    - Example:
    ```javascript
    excludeRules: [
      'State name',
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
      minLayoutPosition: 4, // Threshold for Layout changes. Defaults to 4 pixels.
      minLayoutDimension: 10 // Threshold for Layout changes. Defaults to 10 pixels.
    }
    ```
- **failureExitCode:** The exit code to use on failure. Defaults to 1, which will fail a CI build.
    - To NOT fail a CI build on Screener failure, set to 0. Example:
    ```javascript
    failureExitCode: 0
    ```
- **browsers:** Optional array of browsers for Cross Browser Testing. Each item in array is an object with `browserName` and `version` properties.
    - Note: `browsers` is dependent on `sauce` being added to configuration.
    - `browserName` and `version` *must* match one of the supported browsers/versions in the browser table below.
	- Example:
	```javascript
    browsers: [
      {
        browserName: 'safari',
        version: '10.0'
      }
    ]
    ```
- **sauce:** Optional Sauce Labs credentials for Cross Browser Testing.
    - Example:
    ```javascript
    sauce: {
      username: 'sauce_user',
      accessKey: 'sauce_access_key'
    }
    ```
- **vsts:** Optional configuration for integrating with Visual Studio Team Services.
    - Example:
    ```javascript
    vsts: {
      instance: 'myproject.visualstudio.com'
    }
    ```

### <a name="cross-browser-testing"></a>Sauce Labs Integration for Cross Browser Testing

**Important Notes about Cross Browser Testing:**

- Cross Browser Testing with Sauce Labs will be slower than regular Screener visual regression tests, and so it is not recommended to run on every commit.
- You may want to limit cross browser testing to certain scenarios, such as only when merging into master (see example below).
- Requirements: A valid Sauce Labs account, and access to enough concurrency in your Sauce account to run Screener tests. Each browser/resolution combination will use one concurrent machine.
- Screener's auto-parallelization is disabled when Cross Browser Testing to reduce the number of concurrent browsers required in your Sauce account.

**Overview**

For cross browser testing, Screener integrates with [Sauce Labs](https://saucelabs.com/) to provide access to additional browsers. By default, Screener runs tests against the Chrome browser, which does **not** require a Sauce account. Screener provides Chrome browsers and device emulation out-of-the-box.

To test against multiple browsers, add the `browsers` and `sauce` properties to your screener configuration file. Browsers added *must* match one of the supported browsers/versions in the browser table below.

Here is a CircleCI example that only runs cross browser tests when committing into `master` branch:

```javascript
var config = {
  // regular screener config
};

// only run cross browser tests when merging into ‘master’ branch
if (process.env.CIRCLE_BRANCH === 'master') {
  config.browsers = [
    {
      browserName: 'chrome'
    },
    {
      browserName: 'internet explorer',
      version: '11.103'
    }
  ];
  config.sauce = {
    username: 'sauce_user',
    accessKey: 'sauce_access_key'
  };
}

module.exports = config;
```

**Supported Browsers**

| browserName  | version |
| ------------- | ------------- |
| chrome | *-do not set-* |
| firefox | 55.0 |
| firefox | 54.0 |
| firefox | 53.0 |
| internet explorer | 11.103 |
| microsoftedge | 15.15063 |
| safari | 11.0 |
