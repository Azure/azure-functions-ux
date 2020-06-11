import React, { useState, useContext, useEffect } from 'react';
import FunctionKeysData from './FunctionKeys.data';
import { FunctionKeysFormValues } from './FunctionKeys.types';
import { PortalContext } from '../../../../../PortalContext';
import FunctionKeys from './FunctionKeys';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import SiteService from '../../../../../ApiHelpers/SiteService';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';
import { SiteStateContext } from '../../../../../SiteState';

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
  const startupInfoContext = useContext(StartupInfoContext);
  const siteStateContext = useContext(SiteStateContext);

  const refreshData = async () => {
    if (!!siteStateContext.site) {
      setRefreshLoading(true);
      SiteService.fireSyncTrigger(siteStateContext.site, startupInfoContext.token).then(r => {
        fetchData();
        if (!r.metadata.success) {
          LogService.error(
            LogCategories.functionKeys,
            'fireSyncTrigger',
            `Failed to fire syncTrigger: ${getErrorMessageOrStringify(r.metadata.error)}`
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
