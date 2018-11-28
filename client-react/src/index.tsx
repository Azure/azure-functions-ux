import { initializeIcons } from '@uifabric/icons';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import * as Loadable from 'react-loadable';
import { Provider } from 'react-redux';
import LoadingComponent from './components/loading/loading-component';
import { PortalCommunicator } from './portal-communicator';
import { store } from './store';
import i18n from './utils/i18n';
import { PortalContext } from './PortalContext';

initializeIcons();
const portalCommunicator = new PortalCommunicator(i18n);
portalCommunicator.initializeIframe();

const LoadableComponent = Loadable({
  loader: () => import('./pages/App'),
  loading: LoadingComponent,
});

ReactDOM.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <PortalContext.Provider value={portalCommunicator}>
        <LoadableComponent />
      </PortalContext.Provider>
    </I18nextProvider>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
