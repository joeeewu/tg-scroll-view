module.exports = {
  extends: require.resolve('@umijs/lint/dist/config/eslint'),
  rules: {
    "no-param-reassign": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "eqeqeq": 0,
    "@typescript-eslint/no-unused-expressions": 0,
    "@typescript-eslint/no-this-alias": 0,
    "react/no-find-dom-node": 0,
  },
};
