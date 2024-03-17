const mmkal = require('eslint-plugin-mmkal')

module.exports = [
  ...mmkal.recommendedFlatConfigs, //
  ...mmkal.configs.globals_jest,
  {
    rules: {
      //   'vitest/expect-expect': 'off',
      'vitest/expect-expect': ['error', {assertFunctionNames: ['expect', 'expectTypeOf']}],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
