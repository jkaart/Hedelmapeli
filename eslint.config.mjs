import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  {rules: {
    "camelcase": "error",
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
    "semi": "error",
    "no-extra-semi": "error",
    "prefer-const": "error",
    "no-unused-vars": "error",
    "no-multiple-empty-lines": "error",
    "no-undef": "error",
    "eqeqeq" : "error",
    "no-console": "off",
    "no-var": "error"
    
  }}
];