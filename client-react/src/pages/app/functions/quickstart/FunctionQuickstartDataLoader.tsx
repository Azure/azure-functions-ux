import React, { useEffect, useState, useContext } from 'react';
import LoadingComponent from '../../../../components/loading/loading-component';
import { SiteRouterContext } from '../../SiteRouter';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import FunctionQuickstartData from './FunctionQuickstart.data';
import FunctionQuickstart from './FunctionQuickstart';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { messageBannerStyle } from '../../app-settings/AppSettings.styles';
import { ThemeContext } from '../../../../ThemeContext';
import { useTranslation } from 'react-i18next';

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
      setApiFailure(false);
    } else {
      setSite(siteData.data);
      const appSettings = appSettingsData.data.properties;
      if (appSettings.hasOwnProperty(CommonConstants.AppSettingNames.workerRuntime)) {
        setWorkerRuntime(appSettings[CommonConstants.AppSettingNames.workerRuntime].toLowerCase());
      }
    }
    setInitialLoading(false);
  };

  useEffect(() => {
    fetchData();
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
