import { initializeIcons } from '@uifabric/icons';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import PortalCommunicator from './portal-communicator';
import { store } from './store';
import i18n from './utils/i18n';
import { PortalContext } from './PortalContext';
import App from './pages/App';
import lightTheme from './theme/light';
import { loadTheme } from '@uifabric/styling';
import './pollyfills';
import 'react-app-polyfill/ie11';
import ReactAI from 'react-appinsights';

if (process.env.REACT_APP_APPLICATION_INSIGHTS_KEY) {
  ReactAI.init({ instrumentationKey: process.env.REACT_APP_APPLICATION_INSIGHTS_KEY });
}
initializeIcons();
loadTheme(lightTheme); // make sure we load a custom theme before anything else, custom theme has custom semantic colors
const portalCommunicator = new PortalCommunicator(i18n);
portalCommunicator.initializeIframe();

ReactDOM.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <PortalContext.Provider value={portalCommunicator}>
        <App />
      </PortalContext.Provider>
    </I18nextProvider>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
