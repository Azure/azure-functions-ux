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
  const [initialLoading, setInitialLoading] = useState(true);
  const portalContext = useContext(PortalContext);

  const fetchHostKeys = async () => {
    // TODO : fetch Host-Keys for the App Here..
  };

  const fetchSystemKeys = async () => {
    // TODO : fetch System-Keys for the App Here..
  };

  const fetchData = async () => {
    const site = await appKeysData.getSiteObject(resourceId);

    fetchHostKeys();
    fetchSystemKeys();
    setInitialValues(
      appKeysData.convertStateToForm({
        site: site.data,
        hostKeys: [],
        systemKeys: [],
      })
    );
    portalContext.loadComplete();
    setInitialLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  if (initialLoading || !initialValues) {
    return <LoadingComponent />;
  }

  return (
    <AppKeysContext.Provider value={appKeysData}>
      <AppKeys resourceId={resourceId} initialValues={initialValues} refreshHostKeys={fetchHostKeys} refreshSystemKeys={fetchSystemKeys} />
    </AppKeysContext.Provider>
  );
};

export default AppKeysDataLoader;
