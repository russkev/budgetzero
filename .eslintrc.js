module.exports = {
  root: true,
  env: {
    // this section will be used to determine which APIs are available to us
    // (i.e are we running in a browser environment or a node.js env)
    browser: true,
    es2021: true,
  },
  plugins: ["prettier"],
  extends: [
    // use the recommended rule set for both plain javascript and vue
    "eslint:recommended",
    "plugin:vue/recommended"
  ],
  rules: {
    "rules": {
      "prettier/prettier": "error",
      "vue/multi-word-component-names" : "off"
    }
  }
};
