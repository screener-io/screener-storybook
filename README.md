# Screener-Storybook

Automated Visual Testing for [React Storybook](https://github.com/kadirahq/react-storybook) using [Screener.io](https://screener.io).

Screener-Storybook will use your existing Storybook stories as visual test cases, and run them against [Screener's](https://screener.io) automated visual testing service. Get visual regression tests across your React components with no coding!

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
