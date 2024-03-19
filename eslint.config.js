const mmkal = require('eslint-plugin-mmkal')

module.exports = [
  ...mmkal.recommendedFlatConfigs, //
  ...mmkal.configs.globals_jest,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
