module.exports = {
    ...require('eslint-plugin-mmkal').getRecommended(),
    rules: {
        'mmkal/@typescript-eslint/no-explicit-any': 'off',
    }
}