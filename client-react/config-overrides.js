const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

function addMonacoPlugin(config) {
  config.plugins = (config.plugins || []).concat([
    new MonacoWebpackPlugin({
      languages: ['javascript', 'csharp'],
    }),
  ]);

  return config;
}

module.exports = function override(config, env) {
  config = addMonacoPlugin(config);
  return config;
};
