var Joi = require('joi');
var Promise = require('bluebird');
var stepsSchema = require('screener-runner/src/validate').stepsSchema;
var resolutionSchema = require('screener-runner/src/validate').resolutionSchema;
var browsersSchema = require('screener-runner/src/validate').browsersSchema;
var sauceSchema = require('screener-runner/src/validate').sauceSchema;

exports.storybookConfig = function(value) {
  var schema = Joi.object().keys({
    apiKey: Joi.string().required(),
    projectRepo: Joi.string().max(100).required(),
    storybookConfigDir: Joi.string().required(),
    storybookStaticDir: Joi.string(),
    storybookPort: Joi.number().required(),
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
    branch: Joi.string().max(100),
    commit: Joi.string(),
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
    baseBranch: Joi.string().max(100),
    initialBaselineBranch: Joi.string().max(100),
    diffOptions: Joi.object().keys({
      structure: Joi.boolean(),
      layout: Joi.boolean(),
      style: Joi.boolean(),
      content: Joi.boolean(),
      minLayoutPosition: Joi.number().integer().min(0)
    }),
    sauce: sauceSchema,
    failureExitCode: Joi.number().integer().min(0).max(255).default(1),
    storybookBinPath: Joi.string(),
    storybookVersion: Joi.number().valid(2, 3),
    storybookApp: Joi.string().valid('react', 'vue')
  }).without('resolutions', ['resolution']).with('browsers', ['sauce']).with('storybookBinPath', ['storybookVersion']).required();
  var validator = Promise.promisify(Joi.validate);
  return validator(value, schema);
};
