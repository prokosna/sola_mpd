/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");

const features = fs.readdirSync(path.join(__dirname, "./src/features"));
const zonesRestrictOutsideOfFeatures = features.map((feature) => ({
  from: path.join(__dirname, `./src/features/${feature}/!(index.ts)/**/*`),
  target: path.join(__dirname, "./src/!(features)/**/*"),
  message:
    "Access to the features from outside of the features folder is only allowed through re-exporting in index.ts.",
}));
const zonesRestrictWithinFeatures = features.map((feature) => ({
  from: path.join(__dirname, `./src/features/${feature}/!(index.ts)/**/*`),
  target: path.join(__dirname, `./src/features/!(${feature})/!(states)/**/*`),
  message:
    "Access to the features from other features is only allowed only through re-exporting in index.ts.",
}));
const zonesRestrictAccessFromStates = features.map((feature) => ({
  from: path.join(
    __dirname,
    `./src/features/${feature}/!(states|index.ts)/**/*`,
  ),
  target: [path.join(__dirname, `./src/features/!(${feature})/states/**/*`)],
  message:
    "Only access to index.ts or states of each feature is allowed from other features' states.",
}));
const zonesRestrictAccessToInfrastructure = features.map((feature) => ({
  from: path.join(__dirname, "./src/infrastructure/**/*"),
  target: path.join(__dirname, `./src/features/${feature}/**/*`),
  message: "Features can't access to the infrastructure layer.",
}));

module.exports = {
  extends: ["../../.eslintrc.json", "plugin:react-hooks/recommended"],
  env: { browser: true, es2020: true, node: true },
  plugins: ["react-refresh"],
  rules: {
    "react-hooks/exhaustive-deps": 2,
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "import/no-restricted-paths": [
      "error",
      {
        zones: [
          ...zonesRestrictOutsideOfFeatures,
          ...zonesRestrictWithinFeatures,
          ...zonesRestrictAccessFromStates,
          ...zonesRestrictAccessToInfrastructure,
        ],
      },
    ],
  },
};
