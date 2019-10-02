import React, { useState, useEffect, useContext } from 'react';
import AppKeysData from './AppKeys.data';
import AppKeys from './AppKeys';
import { AppKeysFormValues } from './AppKeys.types';
import LoadingComponent from '../../../../components/loading/loading-component';
import { PortalContext } from '../../../../PortalContext';
import { SiteRouterContext } from '../../SiteRouter';

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
  const portalContext = useContext(PortalContext);
  const siteContext = useContext(SiteRouterContext);

  const refreshData = () => {
    setRefeshLoading(true);
    fetchData();
  };

  const fetchData = async () => {
    const site = await siteContext.fetchSite(resourceId);
    const appKeys = await appKeysData.fetchKeys(resourceId);

    if (appKeys.metadata.status === 409) {
      // TODO: [krmitta] read only permission given (WI: TASK 5476044)
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
  }, []);
  if (initialLoading || !initialValues || refreshLoading) {
    return <LoadingComponent />;
  }

  return (
    <AppKeysContext.Provider value={appKeysData}>
      <AppKeys resourceId={resourceId} initialValues={initialValues} refreshData={refreshData} />
    </AppKeysContext.Provider>
  );
};

export default AppKeysDataLoader;
