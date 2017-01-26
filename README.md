# Screener-Storybook [![Build Status](https://circleci.com/gh/screener-io/screener-storybook/tree/master.svg?style=shield)](https://circleci.com/gh/screener-io/screener-storybook)

Automated Visual Testing for [React Storybook](https://github.com/kadirahq/react-storybook) using [Screener.io](https://screener.io).

Screener-Storybook will use your existing Storybook stories as visual test cases, and run them against [Screener's](https://screener.io) automated visual testing service. Get visual regression tests across your React components with no additional coding!

### Installation

**Note:** Your package.json file must contain a `build-storybook` script for exporting a static version of storybook. [More Info](https://getstorybook.io/docs/react-storybook/basics/exporting-storybook)

In your project, install `screener-storybook`:

```
$ npm install --save-dev screener-storybook
```

Then run the following command in your project root to complete setup (replacing `<SCREENER_API_KEY>` with your actual API key):

```
$ node node_modules/screener-storybook/bin/init.js -k <SCREENER_API_KEY>
```

### Run

```
$ npm run test-storybook
```

### Testing Interactions

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


### Additional Configuration Options

**Note:** Screener will automatically set `build` and `branch` options if you are using one of the following CI tools: Jenkins, CircleCI, Travis CI, Codeship, Drone, Bitbucket Pipelines, Semaphore.

- **build:** Build number from your CI tool. Screener will auto-generate a Build number if not provided.
- **branch:** Current branch name for your repo
- **resolution:** Screen resolution to use. Defaults to `1024x768`
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
