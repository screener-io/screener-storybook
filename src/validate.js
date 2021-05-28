var Joi = require('joi');
var stepsSchema = require('screener-runner/src/validate').stepsSchema;
var resolutionSchema = require('screener-runner/src/validate').resolutionSchema;
var browsersSchema = require('screener-runner/src/validate').browsersSchema;
var sauceSchema = require('screener-runner/src/validate').sauceSchema;
var vstsSchema = require('screener-runner/src/validate').vstsSchema;
var browserStackSchema = require('screener-runner/src/validate').browserStackSchema;

exports.storybookConfig = function(value) {
  var schema = Joi.object().keys({
    apiKey: Joi.string().required(),
    projectRepo: Joi.string().max(100).required(),
    storybookConfigDir: Joi.string().required(),
    storybookStaticDir: Joi.string(),
    storybookStaticBuildDir: Joi.string(),
    storybookPort: Joi.number().required(),
    storybookPreview: Joi.string().required(),
    storybook: Joi.array().min(0).items(
      Joi.object().keys({
        kind: Joi.string().required(),
        stories: Joi.array().min(1).items(
          Joi.object().keys({
            name: Joi.string().required(),
            steps: stepsSchema
          })
        ).required()
      })
    ).required(),
    build: Joi.string().max(40),
    branch: Joi.string().max(200),
    commit: Joi.string(),
    pullRequest: Joi.string(),
    resolution: resolutionSchema,
    resolutions: Joi.array().min(1).items(
      resolutionSchema
    ),
    browsers: browsersSchema,
    cssAnimations: Joi.boolean(),
    ignore: Joi.string(),
    hide: Joi.string(),
    includeRules: Joi.array().min(0).items(
      Joi.string(),
      Joi.object().type(RegExp)
    ),
    excludeRules: Joi.array().min(0).items(
      Joi.string(),
      Joi.object().type(RegExp)
    ),
    baseBranch: Joi.string().max(200),
    initialBaselineBranch: Joi.string().max(200),
    useNewerBaseBranch: Joi.string().valid('accepted', 'latest'),
    disableDiffOnError: Joi.boolean(),
    diffOptions: Joi.object().keys({
      structure: Joi.boolean(),
      layout: Joi.boolean(),
      style: Joi.boolean(),
      content: Joi.boolean(),
      minLayoutPosition: Joi.number().integer().min(0),
      minLayoutDimension: Joi.number().integer().min(0),
      minShiftGraphic: Joi.number().integer().min(0),
      compareSVGDOM: Joi.boolean()
    }),
    sauce: sauceSchema,
    vsts: vstsSchema,
    browserStack: browserStackSchema,
    failOnNewStates: Joi.boolean(),
    alwaysAcceptBaseBranch: Joi.boolean(),
    failureExitCode: Joi.number().integer().min(0).max(255).default(1),
    beforeEachScript: [Joi.func(), Joi.string()],
    ieNativeEvents: Joi.boolean(),
    storybookBinPath: Joi.string(),
    storybookVersion: Joi.number().valid(2, 3, 4, 5),
    storybookApp: Joi.string().valid('react', 'vue', 'angular', 'html')
  })
    .without('resolutions', ['resolution'])
    .without('sauce', ['browserStack'])
    .with('storybookBinPath', ['storybookVersion'])
    .with('useNewerBaseBranch', ['baseBranch'])
    .with('alwaysAcceptBaseBranch', ['baseBranch'])
    .required();

  return schema.validate(value);
};
