import * as i18n from 'i18next';
import Backend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import * as XHR from 'i18next-xhr-backend';

const backendOptions: XHR.BackendOptions = {
  // path where resources get loaded from, or a function
  // returning a path:
  // function(lngs, namespaces) { return customPath; }
  // the returned path will interpolate lng, ns if provided like giving a static path
  loadPath: `${process.env.REACT_APP_SERVER_URL}/api/resources?name={{lng}}&runtime=default&cacheBreaker=${
    process.env.REACT_APP_CACHE_KEY
  }`,

  // your backend server supports multiloading
  // /locales/resources.json?lng=de+en&ns=ns1+ns2
  allowMultiLoading: true, // set loadPath: '/locales/resources.json?lng={{lng}}&ns={{ns}}' to adapt to multiLoading

  // allow cross domain requests
  crossDomain: true,
  parse: data => {
    const t = JSON.parse(data);
    return t.lang || t.en;
  },
  // allow credentials on cross domain requests
  withCredentials: false,
};

const localStorageCacheOptions = {
  // prefix for stored languages
  prefix: `i18next_res`,

  // expiration
  expirationTime: 7 * 24 * 60 * 60 * 1000,
  versions: {
    en: process.env.REACT_APP_CACHE_KEY,
    es: process.env.REACT_APP_CACHE_KEY,
    ko: process.env.REACT_APP_CACHE_KEY,
    ja: process.env.REACT_APP_CACHE_KEY,
    sv: process.env.REACT_APP_CACHE_KEY,
    cs: process.env.REACT_APP_CACHE_KEY,
    'zh-hans': process.env.REACT_APP_CACHE_KEY,
    'zh-hant': process.env.REACT_APP_CACHE_KEY,
    'en-us': process.env.REACT_APP_CACHE_KEY,
    'en-gb': process.env.REACT_APP_CACHE_KEY,
    de: process.env.REACT_APP_CACHE_KEY,
    fr: process.env.REACT_APP_CACHE_KEY,
    hu: process.env.REACT_APP_CACHE_KEY,
    it: process.env.REACT_APP_CACHE_KEY,
    nl: process.env.REACT_APP_CACHE_KEY,
    pl: process.env.REACT_APP_CACHE_KEY,
    pt: process.env.REACT_APP_CACHE_KEY,
    ru: process.env.REACT_APP_CACHE_KEY,
    tr: process.env.REACT_APP_CACHE_KEY,
  },
};
i18n.use(Backend).init({
  backend: {
    backends: [
      LocalStorageBackend, // primary
      XHR, // fallback
    ],
    backendOptions: [localStorageCacheOptions, backendOptions],
  },
  fallbackLng: 'en',
  debug: false,
  // have a common namespace used around the full app
  ns: ['translation'],
  defaultNS: 'translation',

  keySeparator: false, // we use content as keys

  interpolation: {
    escapeValue: false, // not needed for react!!
    formatSeparator: ',',
  },

  react: {
    wait: true,
  },
});

export default i18n;
