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

### Additional Configuration Options

**Note:** Screener will automatically set `build` and `branch` options if you are using one of the following CI tools: Jenkins, CircleCI, Travis CI, Codeship, Drone, Bitbucket Pipelines, Semaphore.

- **build:** Build number from your CI tool. Screener will auto-generate a Build number if not provided.
- **branch:** Current branch name for your repo
- **resolution:** Screen resolution to use. Defaults to `1024x768`
- **ignore:** Comma-delimited string of CSS Selectors that represent areas to be ignored. Example: `.qa-ignore-date, .qa-ignore-ad`
- **includeRules:** Optional array of strings or RegExp expressions to filter states by. Rules are matched against state name. All matching states will be kept.
    - Example:
    ```
    includeRules: [
      'State name',
      /^Component/
    ]
    ```
- **excludeRules:** Optional array of strings or RegExp expressions to filter states by. Rules are matched against state name. All matching states will be removed.
    - Example:
    ```
    excludeRules: [
      'State name',
      /^Component/
    ]
    ```
- **diffOptions:** Visual diff options to control validations.
    - Example:
    ```
    diffOptions: {
      structure: true,
      layout: true,
      style: true,
      content: true
    }
    ```
