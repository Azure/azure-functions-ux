import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MessageBarType } from '@fluentui/react';

import { HttpResponseObject } from '../../../../ArmHelper.types';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import { SiteRouterContext } from '../../SiteRouter';

import AppKeys from './AppKeys';
import AppKeysData from './AppKeys.data';
import { AppKeysFormValues, AppKeysInfo } from './AppKeys.types';

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
  const [fetchKeysSuccess, setFetchKeysSuccess] = useState<boolean>();

  const portalContext = useContext(PortalContext);
  const siteContext = useContext(SiteRouterContext);
  const siteStateContext = useContext(SiteStateContext);

  const { t } = useTranslation();

  const refreshData = () => {
    setRefreshLoading(true);
    fetchData();
  };

  const fetchData = useCallback(async () => {
    const site = await siteContext.fetchSite(resourceId);

    let appKeys: HttpResponseObject<AppKeysInfo> | undefined;
    try {
      appKeys = await appKeysData.fetchKeys(resourceId);
      setFetchKeysSuccess(appKeys.metadata.success);
    } catch {
      setFetchKeysSuccess(false);
    }

    setInitialValues(
      appKeysData.convertStateToForm({
        site: site.data,
        keys: appKeys?.metadata.success ? appKeys.data : null,
      })
    );
    portalContext.loadComplete();
    setInitialLoading(false);
    setRefreshLoading(false);
  }, [portalContext, resourceId, siteContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AppKeysContext.Provider value={appKeysData}>
      {siteStateContext.stopped && fetchKeysSuccess === false && (
        <CustomBanner message={t('noAppKeysWhileFunctionAppStopped')} type={MessageBarType.warning} />
      )}
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
