import React, { useState, useEffect, useContext } from 'react';
import AppKeysData from './AppKeys.data';
import AppKeys from './AppKeys';
import { AppKeysFormValues } from './AppKeys.types';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import { PortalContext } from '../../../../PortalContext';
import { SiteRouterContext } from '../../SiteRouter';
import { disableIFrameStyle } from './AppKeys.styles';
import { SiteStateContext } from '../../../../SiteStateContext';
import { useTranslation } from 'react-i18next';
import AppStopBanner from '../../../../components/AppStopBanner/AppStopBanner';

const appKeysData = new AppKeysData();
export const AppKeysContext = React.createContext(appKeysData);

export interface AppKeysDataLoaderProps {
  resourceId: string;
}

const AppKeysDataLoader: React.FC<AppKeysDataLoaderProps> = props => {
  const { resourceId } = props;
  const [initialValues, setInitialValues] = useState<AppKeysFormValues | null>(null);
  const [refreshLoading, setRefeshLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [appPermission, setAppPermission] = useState(true);

  const portalContext = useContext(PortalContext);
  const siteContext = useContext(SiteRouterContext);
  const siteStateContext = useContext(SiteStateContext);

  const { t } = useTranslation();

  const refreshData = () => {
    setRefeshLoading(true);
    fetchData();
  };

  const fetchData = async () => {
    const site = await siteContext.fetchSite(resourceId);
    const appKeys = await appKeysData.fetchKeys(resourceId);

    if (appKeys.metadata.status === 409 || appKeys.metadata.status === 403) {
      setAppPermission(false);
    }

    setInitialValues(
      appKeysData.convertStateToForm({
        site: site.data,
        keys: appKeys.metadata.success ? appKeys.data : null,
      })
    );
    portalContext.loadComplete();
    setInitialLoading(false);
    setRefeshLoading(false);
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppKeysContext.Provider value={appKeysData}>
      {siteStateContext.stopped && <AppStopBanner message={t('noAppKeysWhileFunctionAppStopped')} />}
      {refreshLoading && (
        <div>
          <LoadingComponent />
          <div className={disableIFrameStyle} />
        </div>
      )}
      <AppKeys
        initialLoading={initialLoading}
        resourceId={resourceId}
        initialValues={initialValues}
        refreshData={refreshData}
        appPermission={appPermission || !siteStateContext.stopped}
      />
    </AppKeysContext.Provider>
  );
};

export default AppKeysDataLoader;
