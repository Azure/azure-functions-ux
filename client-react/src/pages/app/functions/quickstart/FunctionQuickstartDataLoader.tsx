import { MessageBar, MessageBarType } from '@fluentui/react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import { ThemeContext } from '../../../../ThemeContext';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { messageBannerStyle } from '../../app-settings/AppSettings.styles';
import { SiteRouterContext } from '../../SiteRouter';
import FunctionQuickstart from './FunctionQuickstart';
import FunctionQuickstartData from './FunctionQuickstart.data';

const quickstartData = new FunctionQuickstartData();
export const FunctionQuickstartContext = React.createContext(quickstartData);

interface FunctionQuickstartDataLoaderProps {
  resourceId: string;
}

const FunctionQuickstartDataLoader: React.FC<FunctionQuickstartDataLoaderProps> = props => {
  const { resourceId } = props;
  const [initialLoading, setInitialLoading] = useState(true);
  const [site, setSite] = useState<ArmObj<Site> | undefined>(undefined);
  const [workerRuntime, setWorkerRuntime] = useState<string | undefined>(undefined);
  const [apiFailure, setApiFailure] = useState(false);

  const siteContext = useContext(SiteRouterContext);
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const fetchData = async () => {
    const [siteData, appSettingsData] = await Promise.all([
      siteContext.fetchSite(resourceId),
      quickstartData.fetchApplicationSettings(resourceId),
    ]);
    if (!siteData.metadata.success || !appSettingsData.metadata.success) {
      setApiFailure(true);
    } else {
      setSite(siteData.data);
      const appSettings = appSettingsData.data.properties;
      if (Object.prototype.hasOwnProperty.call(appSettings, CommonConstants.AppSettingNames.functionsWorkerRuntime)) {
        setWorkerRuntime(appSettings[CommonConstants.AppSettingNames.functionsWorkerRuntime].toLowerCase());
      }
    }
    setInitialLoading(false);
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (apiFailure) {
    return (
      <MessageBar
        id="quickstart-error-loading"
        className={messageBannerStyle(theme, MessageBarType.error)}
        messageBarType={MessageBarType.error}>
        {t('quickstartLoadFailure')}
      </MessageBar>
    );
  }

  if (initialLoading || !site) {
    return <LoadingComponent />;
  }
  return (
    <FunctionQuickstartContext.Provider value={quickstartData}>
      <FunctionQuickstart resourceId={resourceId} site={site} workerRuntime={workerRuntime} />
    </FunctionQuickstartContext.Provider>
  );
};

export default FunctionQuickstartDataLoader;
