/* config-overrides.js */
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

/* https://github.com/timarney/react-app-rewired#extended-configuration-options */
module.exports = {
  devServer: configFunction => {
    return (proxy, allowedHost) => {
      const config = configFunction(proxy, allowedHost);
      return config;
    };
  },
  jest: config => {
    config.collectCoverageFrom = [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!<rootDir>/node_modules/',
      '!src/**/*.stories.{ts,tsx}',
      '!src/**/*.styles.{ts,tsx}',
      '!src/**/*.types.{ts,tsx}',
      '!src/*',
      '!src/mocks/**',
      '!src/models/**',
      '!src/theme/**',
      '!src/utils/Guid.ts',
      '!src/utils/scenario-checker/**',
    ];
    config.moduleNameMapper = {
      ...config.moduleNameMapper,
      '^joi$': '<rootDir>/node_modules/joi-browser/dist/joi-browser.min',
    };
    config.testEnvironment = 'jest-environment-jsdom-sixteen';
    config.testPathIgnorePatterns = [
      ...(config.testPathIgnorePatterns ?? []),
      /** @todo Fix "Cannot read property 'getParameterByName' of undefined" error. */
      '<rootDir>/src/pages/app/app-settings/GeneralSettings/WindowsStacks/JavaData.spec.ts',
      '<rootDir>/src/utils/arm-utils.spec.ts',
    ];
    /** @note https://github.com/timarney/react-app-rewired/issues/241#issuecomment-387584632 */
    config.transformIgnorePatterns = [
      /** @note Do not transform `@fluentui/react` and `lodash-es` modules. */
      'node_modules/(?!(@fluentui/react|lodash-es)/)',
    ];

    return config;
  },
  webpack: (config, _env) => {
    /** @note Include support for these monaco-editor languages. */
    config.plugins = [
      ...(config?.plugins ?? []),
      new MonacoWebpackPlugin({
        features: ['!gotoSymbol'], // https://github.com/microsoft/monaco-editor-webpack-plugin/issues/92#issuecomment-569589854
        languages: ['json', 'markdown', 'csharp', 'bat', 'fsharp', 'javascript', 'powershell', 'python', 'typescript', 'php', 'shell'],
      }),
    ];
    /** @note Configure webpack to resolve `joi` module references as `joi-browser`. */
    config.resolve = { ...config.resolve, alias: { ...config.resolve.alias, joi: 'joi-browser' } };
    return config;
  },
};
