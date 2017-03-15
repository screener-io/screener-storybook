var Joi = require('joi');
var Promise = require('bluebird');
var stepsSchema = require('screener-runner/src/validate').stepsSchema;
var resolutionSchema = require('screener-runner/src/validate').resolutionSchema;

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
    resolution: resolutionSchema,
    resolutions: Joi.array().min(1).items(
      resolutionSchema
    ),
    ignore: Joi.string(),
    includeRules: Joi.array().min(0).items(
      Joi.string(),
      Joi.object().type(RegExp)
    ),
    excludeRules: Joi.array().min(0).items(
      Joi.string(),
      Joi.object().type(RegExp)
    ),
    diffOptions: Joi.object().keys({
      structure: Joi.boolean(),
      layout: Joi.boolean(),
      style: Joi.boolean(),
      content: Joi.boolean()
    })
  }).without('resolutions', ['resolution']).required();
  var validator = Promise.promisify(Joi.validate);
  return validator(value, schema);
};
