// module.exports = {
//   extends: "react-app",
//   plugins: ["graphql"],
//   parser: "babel-eslint",
//   rules: {
//     "graphql/template-strings": [
//       "error",
//       {
//         schemaJson: require("./schema.json"),
//       },
//       {
//         tagName: "spaceql",
//         schemaJson: require("./spacex.json"),
//       },
//     ],
//   },
// };

module.exports = {
  extends: "react-app",
  parser: "babel-eslint",
  rules: {
    "graphql/template-strings": [
      "error",
      {
        env: "apollo",
        schemaJson: require("./schema.json"),
      },
      {
        tagName: "spaceql",
        schemaJson: require("./spacex.json"),
      },
    ],
  },
  plugins: ["graphql"],
};
