// {
//   "extends": ["tslint-react-hooks", "tslint-config-airbnb", "tslint:recommended", "tslint-config-prettier"],
//   "rules": {
//     "object-literal-sort-keys": 0,
//     "no-console": 0,
//     "jsx-no-lambda": 0,
//     "indent": [true, "spaces", 2],
//     "eofline": 0,
//     "variable-name": 0,
//     "max-line-length": 0,
//     "ter-arrow-parens": 0,
//     "ter-indent": 0,
//     "import-name": 0,
//     "ordered-imports": 0,
//     "interface-name": 0,
//     "array-type": 0,
//     "function-name": 0,
//     "react-hooks-nesting": "error",
//     "no-string-literal": 0,
//     "member-access": [true]
//   },
//   "linterOptions": {
//     "exclude": ["config/**/*.js", "node_modules/**/*.ts", "node_modules/**/*.js"]
//   }
// }

module.exports = {
  extends: ['airbnb-typescript', 'airbnb/hooks', 'plugin:@typescript-eslint/recommended'],
  plugins: ['react', '@typescript-eslint'],
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    'linebreak-style': 'off',
    'object-literal-sort-keys': 0,
    'no-console': 0,
    'jsx-no-lambda': 0,
    indent: [1, 2],
    eofline: 0,
    'variable-name': 0,
    'max-line-length': 0,
    'ter-arrow-parens': 0,
    'ter-indent': 0,
    'import-name': 0,
    'ordered-imports': 0,
    'interface-name': 0,
    'array-type': 0,
    'function-name': 0,
    'no-string-literal': 0,
    'object-curly-newline': 0,
    'max-len': 0,
    'no-underscore-dangle': 0,
    '@typescript-eslint/comma-dangle': 0,
    'no-await-in-loop': 0,
    'operator-assignment': 0,
    'object-shorthand': 0,
    '@typescript-eslint/dot-notation': 0,
    'import/no-useless-path-segments': 0,
    'import/no-duplicates': 0,
  },
};
