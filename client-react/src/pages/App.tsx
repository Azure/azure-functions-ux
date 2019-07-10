import { Router } from '@reach/router';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import React, { useState, useEffect, Suspense } from 'react';
import AppServiceRouter from './app/AppServiceRouter';
import LandingPage from './LandingPage/LandingPage';
import ErrorLogger from '../components/ErrorLogger';
import { I18nextProvider } from 'react-i18next';
import i18n from '../utils/i18n';
import { PortalContext } from '../PortalContext';
import PortalCommunicator from '../portal-communicator';
import lightTheme from '../theme/light';
import { ThemeExtended } from '../theme/SemanticColorsExtended';
import { ThemeContext } from '../ThemeContext';
import { ArmTokenContext } from '../ArmTokenContext';
import { IStartupInfo } from '../models/portal-models';
import { StartupInfoContext } from '../StartupInfoContext';
import LoadingComponent from '../components/loading/loading-component';

const portalCommunicator = new PortalCommunicator();

export const App: React.FC = () => {
  const [theme, setTheme] = useState(lightTheme as ThemeExtended);
  const [startupInfo, setStartupInfo] = useState({} as IStartupInfo<any>);
  const [armToken, setArmToken] = useState('');
  useEffect(() => {
    portalCommunicator.initializeIframe(setTheme, setArmToken, setStartupInfo, i18n);
  }, []);
  return (
    <Suspense fallback={<LoadingComponent />}>
      <I18nextProvider i18n={i18n}>
        <ThemeContext.Provider value={theme}>
          <ArmTokenContext.Provider value={armToken}>
            <StartupInfoContext.Provider value={startupInfo}>
              <PortalContext.Provider value={portalCommunicator}>
                <Fabric>
                  <ErrorLogger>
                    <Router>
                      <AppServiceRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:siteName/slots/:slotName/*" />
                      <AppServiceRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:siteName/*" />
                      <AppServiceRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:siteName/functions/:functionName/*" />
                      <LandingPage path="/*" />
                    </Router>
                  </ErrorLogger>
                </Fabric>
              </PortalContext.Provider>
            </StartupInfoContext.Provider>
          </ArmTokenContext.Provider>
        </ThemeContext.Provider>
      </I18nextProvider>
    </Suspense>
  );
};

export default App;
