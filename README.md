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

---

### <a name="testing-interactions"></a>Testing Interactions

To test interactions, you can add `steps` to your existing Storybook stories. Each `step` is an instruction to interact with the component. This is useful for clicking buttons, filling out forms, and getting your components into the proper visual state to test. This also keeps your stories and interaction test code in the same place.

To add `steps` to a story, wrap your component within a `Screener` component, and pass it a `steps` prop. The `steps` can then be generated using our fluent API. Step methods with selectors have built-in waits to simplify test flow creation.

Here is an example:

```javascript
import Screener, {Steps} from 'screener-storybook/src/screener';

storiesOf('MyComponent', module)
  .add('default', () => {
    const steps = new Steps()
      .click('.selector')
      .snapshot('name')
      .end();
    return (
      <Screener steps={steps}>
        <MyComponent />
      </Screener>
    );
  });
```

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

**Note 1:** The `Screener` component **must** be the top-most component returned within a story.

**Note 2:** When adding `Steps` using the fluent API, you **must** end the method chain with `end()`.


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

**Note:** Screener will automatically set `build` and `branch` options if you are using one of the following CI tools: Jenkins, CircleCI, Travis CI, Codeship, Drone, Bitbucket Pipelines, Semaphore.

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
- **ignore:** Comma-delimited string of CSS Selectors that represent areas to be ignored. Example: `.qa-ignore-date, .qa-ignore-ad`
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
