module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    '@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true }],
    'no-bitwise': 'warn',
  },
};
