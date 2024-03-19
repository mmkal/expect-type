const mmkal = require('eslint-plugin-mmkal')

module.exports = [
  ...mmkal.recommendedFlatConfigs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
