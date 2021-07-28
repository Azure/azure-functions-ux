const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = () => {
  return {
    webpack: {
      plugins: [
        new MonacoWebpackPlugin({
          languages: ['json', 'markdown', 'csharp', 'bat', 'fsharp', 'javascript', 'powershell', 'python', 'typescript', 'php', 'shell'],
        }),
      ],
      alias: {
        joi: 'joi-browser',
      },
    },
  };
};
