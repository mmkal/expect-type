// eslint-disable-next-line mmkal/import/no-extraneous-dependencies
const recommended = require('eslint-plugin-mmkal').getRecommended()

module.exports = {
  ...recommended,
  overrides: [
    ...recommended.overrides,
    {
      files: ['*.md'],
      rules: {
        'mmkal/unicorn/filename-case': 'off',
      },
    },
  ],
  rules: {
    'mmkal/@typescript-eslint/no-explicit-any': 'off',
  },
}
