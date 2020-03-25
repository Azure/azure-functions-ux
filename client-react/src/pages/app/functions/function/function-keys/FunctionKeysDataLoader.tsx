import React, { useState, useContext, useEffect } from 'react';
import FunctionKeysData from './FunctionKeys.data';
import { FunctionKeysFormValues } from './FunctionKeys.types';
import { PortalContext } from '../../../../../PortalContext';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import FunctionKeys from './FunctionKeys';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import SiteService from '../../../../../ApiHelpers/SiteService';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
import { ArmObj } from '../../../../../models/arm-obj';
import { Site } from '../../../../../models/site/site';

const functionKeysData = new FunctionKeysData();
export const FunctionKeysContext = React.createContext(functionKeysData);

interface FunctionsKeysDataLoaderProps {
  resourceId: string;
}

const FunctionsKeysDataLoader: React.FC<FunctionsKeysDataLoaderProps> = props => {
  const { resourceId } = props;
  const [initialValues, setInitialValues] = useState<FunctionKeysFormValues | null>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [appPermission, setAppPermission] = useState(true);
  const [site, setSite] = useState<ArmObj<Site> | undefined>(undefined);

  const portalContext = useContext(PortalContext);
  const startupInfoContext = useContext(StartupInfoContext);

  const refreshData = async () => {
    if (!!site) {
      setRefreshLoading(true);
      SiteService.fireSyncTrigger(site, startupInfoContext.token).then(r => {
        fetchData();
        if (!r.metadata.success) {
          LogService.error(LogCategories.functionKeys, 'fireSyncTrigger', `Failed to fire syncTrigger: ${r.metadata.error}`);
        }
      });
    }
  };

  const fetchData = async () => {
    const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
    const siteResourceId = armSiteDescriptor.getTrimmedResourceId();

    const [siteResponse, functionKeys] = await Promise.all([SiteService.fetchSite(siteResourceId), functionKeysData.fetchKeys(resourceId)]);

    if (siteResponse.metadata.success) {
      setSite(siteResponse.data);
    } else {
      LogService.error(LogCategories.functionKeys, 'fetchSite', `Failed to fetch site: ${siteResponse.metadata.error}`);
    }

    if (functionKeys.metadata.status === 409 || functionKeys.metadata.status === 403) {
      setAppPermission(false);
    }

    setInitialValues(
      functionKeysData.convertStateToForm({
        keys: functionKeys.metadata.success ? functionKeys.data : null,
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

  if (initialLoading || !initialValues || !site) {
    return <LoadingComponent />;
  }

  return (
    <FunctionKeysContext.Provider value={functionKeysData}>
      <FunctionKeys
        resourceId={resourceId}
        initialValues={initialValues}
        refreshData={refreshData}
        setRefreshLoading={setRefreshLoading}
        refreshLoading={refreshLoading}
        appPermission={appPermission}
      />
    </FunctionKeysContext.Provider>
  );
};

export default FunctionsKeysDataLoader;
