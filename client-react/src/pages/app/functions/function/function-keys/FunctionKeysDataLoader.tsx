import React, { useContext, useEffect, useState } from 'react';

import SiteService from '../../../../../ApiHelpers/SiteService';
import { PortalContext } from '../../../../../PortalContext';
import { SiteStateContext } from '../../../../../SiteState';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';

import FunctionKeys from './FunctionKeys';
import FunctionKeysData from './FunctionKeys.data';
import { FunctionKeysFormValues } from './FunctionKeys.types';

const functionKeysData = new FunctionKeysData();
export const FunctionKeysContext = React.createContext(functionKeysData);

interface FunctionsKeysDataLoaderProps {
  resourceId: string;
}

const FunctionsKeysDataLoader: React.FC<FunctionsKeysDataLoaderProps> = props => {
  const { resourceId } = props;
  const [initialValues, setInitialValues] = useState<FunctionKeysFormValues>({ keys: [] });
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [appPermission, setAppPermission] = useState(true);

  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);

  const refreshData = async () => {
    if (siteStateContext.site) {
      setRefreshLoading(true);
      SiteService.fireSyncTrigger(siteStateContext.site).then(r => {
        fetchData();
        if (!r.metadata.success) {
          portalContext.log(
            getTelemetryInfo('error', 'fireSyncTrigger', 'failed', {
              error: r.metadata.error,
              message: 'Failed to fire sync-trigger',
            })
          );
        }
      });
    }
  };

  const fetchData = async () => {
    const functionKeys = await functionKeysData.fetchKeys(resourceId);

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

  return (
    <FunctionKeysContext.Provider value={functionKeysData}>
      <FunctionKeys
        resourceId={resourceId}
        initialValues={initialValues}
        refreshData={refreshData}
        setRefreshLoading={setRefreshLoading}
        loading={initialLoading || refreshLoading}
        appPermission={appPermission}
      />
    </FunctionKeysContext.Provider>
  );
};

export default FunctionsKeysDataLoader;
