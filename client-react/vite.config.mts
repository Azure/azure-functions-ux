import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Plugin, createFilter, defineConfig, loadEnv, transformWithEsbuild } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * We can ignore the following build warning, because we do not use `lintFile` in `yaml-lint`.
 * [plugin:vite:resolve] [plugin vite:resolve] Module "fs" has been externalized for browser compatibility,
 * imported by "C:/joechung-msft/azure-functions-ux/client-react/node_modules/yaml-lint/dist/index.js".
 * See https://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility
 * for more details.
 */

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  setEnv(mode);
  return {
    plugins: [
      // https://github.com/bhbs/viject
      react(),
      tsconfigPaths(),
      envPlugin(),
      devServerPlugin(),
      sourcemapPlugin(),
      importPrefixPlugin(),
      htmlPlugin(mode),
      svgrPlugin(),
      // https://github.com/vitejs/vite-plugin-basic-ssl
      basicSsl(),
    ],
    /** @note Use absolute root path for script references, e.g., https://functions.azure.com/static/index-Bi1bz7Ug.js */
    base: '/',
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        /** @note Rename `assets` to `static` to align with what AFD expects. https://stackoverflow.com/questions/71180561/vite-change-ouput-directory-of-assets */
        output: {
          assetFileNames: 'static/[name]-[hash][extname]',
          chunkFileNames: 'static/[name]-[hash].js',
          entryFileNames: 'static/[name]-[hash].js',
        },
      },
    },
    resolve: {
      alias: {
        joi: 'joi-browser',
      },
    },
    server: {
      proxy: {
        '/api': {
          changeOrigin: true,
          secure: false,
          target: 'https://localhost:44300',
        },
      },
    },
  };
});

/** @note Functions added by https://github.com/bhbs/viject */

function setEnv(mode: string) {
  Object.assign(process.env, loadEnv(mode, '.', ['REACT_APP_', 'NODE_ENV', 'PUBLIC_URL']));
  process.env.NODE_ENV ||= mode;
  const { homepage } = JSON.parse(readFileSync('package.json', 'utf-8'));
  process.env.PUBLIC_URL ||= homepage
    ? `${homepage.startsWith('http') || homepage.startsWith('/') ? homepage : `/${homepage}`}`.replace(/\/$/, '')
    : '';
}

// Expose `process.env` environment variables to your client code
// Migration guide: Follow the guide below to replace process.env with import.meta.env in your app, you may also need to rename your environment variable to a name that begins with VITE_ instead of REACT_APP_
// https://vitejs.dev/guide/env-and-mode.html#env-variables
function envPlugin(): Plugin {
  return {
    name: 'env-plugin',
    config(_, { mode }) {
      const env = loadEnv(mode, '.', ['REACT_APP_', 'NODE_ENV', 'PUBLIC_URL']);
      return {
        define: Object.fromEntries(Object.entries(env).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])),
      };
    },
  };
}

// Setup HOST, SSL, PORT
// Migration guide: Follow the guides below
// https://vitejs.dev/config/server-options.html#server-host
// https://vitejs.dev/config/server-options.html#server-https
// https://vitejs.dev/config/server-options.html#server-port
function devServerPlugin(): Plugin {
  return {
    name: 'dev-server-plugin',
    config(_, { mode }) {
      const { HOST, PORT, HTTPS, SSL_CRT_FILE, SSL_KEY_FILE } = loadEnv(mode, '.', [
        'HOST',
        'PORT',
        'HTTPS',
        'SSL_CRT_FILE',
        'SSL_KEY_FILE',
      ]);
      const https = HTTPS === 'true';
      return {
        server: {
          host: HOST || '0.0.0.0',
          port: parseInt(PORT || '3000', 10),
          open: true,
          ...(https &&
            SSL_CRT_FILE &&
            SSL_KEY_FILE && {
              https: {
                cert: readFileSync(resolve(SSL_CRT_FILE)),
                key: readFileSync(resolve(SSL_KEY_FILE)),
              },
            }),
        },
      };
    },
  };
}

// Migration guide: Follow the guide below
// https://vitejs.dev/config/build-options.html#build-sourcemap
function sourcemapPlugin(): Plugin {
  return {
    name: 'sourcemap-plugin',
    config(_, { mode }) {
      const { GENERATE_SOURCEMAP } = loadEnv(mode, '.', ['GENERATE_SOURCEMAP']);
      return {
        build: {
          sourcemap: GENERATE_SOURCEMAP === 'true',
        },
      };
    },
  };
}

// Migration guide: Follow the guide below
// https://vitejs.dev/config/build-options.html#build-outdir
/** @note buildPathPlugin replaced with custom `build` configuration */

// Migration guide: Follow the guide below and remove homepage field in package.json
// https://vitejs.dev/config/shared-options.html#base
/** @note basePlugin replaced with custom `base` configuration */

// To resolve modules from node_modules, you can prefix paths with ~
// https://create-react-app.dev/docs/adding-a-sass-stylesheet
// Migration guide: Follow the guide below
// https://vitejs.dev/config/shared-options.html#resolve-alias
function importPrefixPlugin(): Plugin {
  return {
    name: 'import-prefix-plugin',
    config() {
      return {
        resolve: {
          alias: [{ find: /^~([^/])/, replacement: '$1' }],
        },
      };
    },
  };
}

// In Create React App, SVGs can be imported directly as React components. This is achieved by svgr libraries.
// https://create-react-app.dev/docs/adding-images-fonts-and-files/#adding-svgs
function svgrPlugin(): Plugin {
  const filter = createFilter('**/*.svg');
  const postfixRE = /[?#].*$/s;

  return {
    name: 'svgr-plugin',
    async transform(code, id) {
      if (filter(id)) {
        const { transform } = await import('@svgr/core');
        const { default: jsx } = await import('@svgr/plugin-jsx');

        const filePath = id.replace(postfixRE, '');
        const svgCode = readFileSync(filePath, 'utf8');

        const componentCode = await transform(svgCode, undefined, {
          filePath,
          caller: {
            previousExport: code,
            defaultPlugins: [jsx],
          },
        });

        const res = await transformWithEsbuild(componentCode, id, {
          loader: 'jsx',
        });

        return {
          code: res.code,
          map: null,
        };
      }
    },
  };
}

// Configuring the Proxy in package.json
// https://create-react-app.dev/docs/proxying-api-requests-in-development/
// Migration guide: Follow the guide below and remove proxy field in package.json
// https://vitejs.dev/config/server-options.html#server-proxy
/** @note proxyPlugin replaced with custom `proxy` configuration. */

// Replace %ENV_VARIABLES% in index.html
// https://vitejs.dev/guide/api-plugin.html#transformindexhtml
// Migration guide: Follow the guide below, you may need to rename your environment variable to a name that begins with VITE_ instead of REACT_APP_
// https://vitejs.dev/guide/env-and-mode.html#html-env-replacement
function htmlPlugin(mode: string): Plugin {
  const env = loadEnv(mode, '.', ['REACT_APP_', 'NODE_ENV', 'PUBLIC_URL']);
  return {
    name: 'html-plugin',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/%(.*?)%/g, (match, p1) => env[p1] ?? match);
      },
    },
  };
}
