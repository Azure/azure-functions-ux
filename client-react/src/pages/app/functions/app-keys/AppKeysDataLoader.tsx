import React, { useState, useEffect, useContext } from 'react';
import AppKeysData from './AppKeys.data';
import AppKeys from './AppKeys';
import { AppKeysFormValues } from './AppKeys.types';
import { PortalContext } from '../../../../PortalContext';
import { SiteRouterContext } from '../../SiteRouter';
import { SiteStateContext } from '../../../../SiteState';
import { useTranslation } from 'react-i18next';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { MessageBarType } from 'office-ui-fabric-react';

const appKeysData = new AppKeysData();
export const AppKeysContext = React.createContext(appKeysData);

export interface AppKeysDataLoaderProps {
  resourceId: string;
}

const AppKeysDataLoader: React.FC<AppKeysDataLoaderProps> = props => {
  const { resourceId } = props;
  const [initialValues, setInitialValues] = useState<AppKeysFormValues | null>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const portalContext = useContext(PortalContext);
  const siteContext = useContext(SiteRouterContext);
  const siteStateContext = useContext(SiteStateContext);

  const { t } = useTranslation();

  const refreshData = () => {
    setRefreshLoading(true);
    fetchData();
  };

  const fetchData = async () => {
    const site = await siteContext.fetchSite(resourceId);
    const appKeys = await appKeysData.fetchKeys(resourceId);

    setInitialValues(
      appKeysData.convertStateToForm({
        site: site.data,
        keys: appKeys.metadata.success ? appKeys.data : null,
      })
    );
    portalContext.loadComplete();
    setInitialLoading(false);
    setRefreshLoading(false);
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppKeysContext.Provider value={appKeysData}>
      {siteStateContext.stopped && <CustomBanner message={t('noAppKeysWhileFunctionAppStopped')} type={MessageBarType.warning} />}
      <AppKeys
        resourceId={resourceId}
        initialValues={initialValues}
        refreshData={refreshData}
        appPermission={!siteStateContext.stopped}
        loading={initialLoading || refreshLoading}
      />
    </AppKeysContext.Provider>
  );
};

export default AppKeysDataLoader;
