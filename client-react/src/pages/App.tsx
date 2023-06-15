import { Fabric } from '@fluentui/react';
import { Router } from '@reach/router';
import React, { Suspense, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import ErrorLogger from '../components/ErrorLogger';
import LoadingComponent from '../components/Loading/LoadingComponent';
import { IFeatureInfo, IStartupInfo } from '../models/portal-models';
import PortalCommunicator from '../portal-communicator';
import { PortalContext } from '../PortalContext';
import { StartupInfoContext } from '../StartupInfoContext';
import { lightTheme } from '../theme/light';
import { ThemeExtended } from '../theme/SemanticColorsExtended';
import { ThemeContext } from '../ThemeContext';
import i18n from '../utils/i18n';
import SiteRouter from './app/SiteRouter';
import ContainerAppEnvironmentRouter from './container-app/ContainerAppEnvironmentRouter';
import ContainerAppRouter from './container-app/ContainerAppRouter';
import LandingPage from './LandingPage/LandingPage';
import StaticSiteRouter from './static-app/StaticSiteRouter';

const portalCommunicator = new PortalCommunicator();

export const App: React.FC = () => {
  const [theme, setTheme] = useState(lightTheme as ThemeExtended);
  const [startupInfo, setStartupInfo] = useState({} as IStartupInfo<any>);
  const [featureInfo, setFeatureInfo] = useState({} as IFeatureInfo<any>);

  useEffect(() => {
    portalCommunicator.initializeIframe(setTheme, setStartupInfo, setFeatureInfo, i18n);
  }, []);

  useEffect(() => {
    setStartupInfo({ ...startupInfo, featureInfo });
  }, [featureInfo]);

  return (
    <Suspense fallback={<LoadingComponent />}>
      <I18nextProvider i18n={i18n}>
        <ThemeContext.Provider value={theme}>
          <StartupInfoContext.Provider value={startupInfo}>
            <PortalContext.Provider value={portalCommunicator}>
              <Fabric>
                <ErrorLogger>
                  <Router>
                    <SiteRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:siteName/*" />
                    <SiteRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:siteName/slots/:slotName/*" />
                    <SiteRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:siteName/functions/:functionName/*" />
                    <SiteRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:siteName/slots/:slotName/functions/:functionName/*" />
                    <StaticSiteRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.web/staticsites/:staticSiteName/*" />
                    <StaticSiteRouter path="feature/subscriptions/:subscriptionId/providers/microsoft.web/staticsites/*" />
                    <ContainerAppRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.app/containerapps/:appName/*" />
                    <ContainerAppEnvironmentRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.app/managedenvironments/:envName/*" />
                    <LandingPage path="/*" />
                  </Router>
                </ErrorLogger>
              </Fabric>
            </PortalContext.Provider>
          </StartupInfoContext.Provider>
        </ThemeContext.Provider>
      </I18nextProvider>
    </Suspense>
  );
};

export default App;
