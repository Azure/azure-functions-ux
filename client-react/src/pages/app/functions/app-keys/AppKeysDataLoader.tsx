import React, { useState, useEffect, useContext } from 'react';
import AppKeysData from './AppKeys.data';
import AppKeys from './AppKeys';
import { AppKeysFormValues } from './AppKeys.types';
import LoadingComponent from '../../../../components/loading/loading-component';
import { PortalContext } from '../../../../PortalContext';

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

  const refreshData = () => {
    setRefeshLoading(true);
    fetchData();
  };

  const fetchData = async () => {
    const site = await appKeysData.getSiteObject(resourceId);
    const appKeys = await appKeysData.getKeys(resourceId);

    if (appKeys.metadata.status === 409) {
      // TODO: read only permissions given
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
