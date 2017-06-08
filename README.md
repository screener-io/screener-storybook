# Screener-Storybook [![Build Status](https://circleci.com/gh/screener-io/screener-storybook/tree/master.svg?style=shield)](https://circleci.com/gh/screener-io/screener-storybook)

Automated Visual Testing for [React Storybook](https://github.com/kadirahq/react-storybook) using [Screener.io](https://screener.io).

Screener-Storybook will use your existing Storybook stories as visual test cases, and run them against [Screener's](https://screener.io) automated visual testing service. Get visual regression tests across your React components with no additional coding!

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

To add `steps` to a story, wrap your component within a `Screener` component, and pass it a `steps` prop. The `steps` can then be generated using our fluent API. Step methods with selectors have built-in waits to simplify test flow creation.

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

Please note that the `Screener` component **must** be the top-most component returned within a story. If you use `addDecorator` in your stories, ensure the **last** decorator contains the `Screener` component and `steps`.


#### Steps
The following step methods are currently available:

- `click(selector)`: this will click on the first element matching the provided css selector.
- `snapshot(name)`: this will capture a Screener snapshot.
- `hover(selector)`: this will move the mouse over the first element matching the provided css selector.
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

**Note:** Screener will automatically set `build` and `branch` options if you are using one of the following CI tools: Jenkins, CircleCI, Travis CI, Codeship, GitLab CI, Drone, Bitbucket Pipelines, Semaphore.

- **build:** Build number from your CI tool. Screener will auto-generate a Build number if not provided.
- **branch:** Current branch name for your repo
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
- **initialBaselineBranch:** Optional branch name you would like to get the initial baseline of UI states from (e.g. master).
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
      content: true
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

### <a name="cross-browser-testing"></a>Sauce Labs Integration for Cross Browser Testing

**Important Notes about Cross Browser Testing:**

- **Performance Warning:** Cross Browser Testing with Sauce Labs will be slower than regular Screener visual regression tests, and so it is not recommended to run on every commit.
- Cross Browser Testing, in most cases, does not need to be run continuously (unlike visual regression testing, which should be run continuously on commit). You may only want to run cross browser tests at certain times, such as when deploying to a staging environment.
- Cross Browser Testing requires a valid Sauce Labs account, and access to enough concurrency in your Sauce account to run Screener tests. Each browser/resolution combination will use one concurrent machine.
- Screener's auto-parallelization is disabled when Cross Browser Testing, to reduce the number of concurrent browsers required in your Sauce account.

**Overview**

For cross browser testing, Screener integrates with [Sauce Labs](https://saucelabs.com/) to provide access to additional browsers. By default, Screener runs tests against Chrome browser, which does *not* require a Sauce account.

To test against multiple browsers, you can add the `browsers` and `sauce` properties to your screener configuration file. Browsers added *must* match one of the supported browsers/versions in the browser table below.

Here is a CircleCI example that only runs cross browser tests when committing into `master` branch:

```javascript
var browsers;

// only run cross browser tests when merging into ‘master’ branch
if (process.env.CIRCLE_BRANCH === 'master') {
  browsers = [
    {
      browserName: 'chrome'
    },
    {
      browserName: 'internet explorer',
      version: '11.103'
    }
  ]
}

module.exports = {
  ...

  browsers: browsers,
  sauce: {
    username: 'sauce_user',
    accessKey: 'sauce_access_key'
  }
};
```

**Supported Browsers**

| browserName  | version |
| ------------- | ------------- |
| chrome | *-do not set-* |
| firefox | 53.0 |
| firefox | 52.0 |
| firefox | 51.0 |
| firefox | 50.0 |
| internet explorer | 11.103 |
| microsoftedge | 14.14393 |
| safari | 10.0 |
