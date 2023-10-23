const eslint = require("@discourse/lint-configs/eslint-theme");

const config = { ...eslint };
config.ignorePatterns.push("javascripts/discourse/lib/minimasonry.js");

module.exports = config;
