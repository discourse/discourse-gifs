const { default: transformImports } = require("./babel-replace-imports.mjs");

module.exports = {
  plugins: [
    [
      "babel-plugin-ember-template-compilation",
      {
        // targetFormat: "hbs",
        transforms: [],
      },
    ],
    [
      "module:decorator-transforms",
      {
        runtime: "globals",
      },
    ],
    [transformImports],
  ],

  generatorOpts: {
    compact: false,
  },
};
