import React, { useEffect, useState, useContext } from 'react';
import AppFilesData from './AppFiles.data';
import AppFiles from './AppFiles';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import SiteService from '../../../ApiHelpers/SiteService';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import { CommonConstants } from '../../../utils/CommonConstants';
import FunctionsService from '../../../ApiHelpers/FunctionsService';
import { VfsObject } from '../../../models/functions/vfs';
import { SiteStateContext } from '../../../SiteStateContext';
import AppStopBanner from '../../../components/AppStopBanner/AppStopBanner';
import { useTranslation } from 'react-i18next';

interface AppFilesDataLoaderProps {
  resourceId: string;
}

const appFilesData = new AppFilesData();
export const AppFilesContext = React.createContext(appFilesData);

const AppFilesDataLoader: React.FC<AppFilesDataLoaderProps> = props => {
  const { resourceId } = props;
  const [initialLoading, setInitialLoading] = useState(true);
  const [site, setSite] = useState<ArmObj<Site> | undefined>(undefined);
  const [runtimeVersion, setRuntimeVersion] = useState<string | undefined>(undefined);

  const [fileList, setFileList] = useState<VfsObject[] | undefined>(undefined);

  const siteStateContext = useContext(SiteStateContext);

  const { t } = useTranslation();

  const fetchData = async () => {
    const [siteResponse, appSettingsResponse] = await Promise.all([
      SiteService.fetchSite(resourceId),
      SiteService.fetchApplicationSettings(resourceId),
    ]);
    if (siteResponse.metadata.success) {
      setSite(siteResponse.data);
    }
    if (appSettingsResponse.metadata.success) {
      const currentRuntimeVersion = appSettingsResponse.data.properties[CommonConstants.AppSettingNames.functionsExtensionVersion];
      setRuntimeVersion(currentRuntimeVersion);
      const fileListResponse = await FunctionsService.getFileContent(resourceId, undefined, currentRuntimeVersion);
      setFileList(fileListResponse.data as VfsObject[]);
    }
    setInitialLoading(false);
  };

  useEffect(() => {
    if (!siteStateContext.stopped) {
      fetchData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (initialLoading || !site) {
    return <LoadingComponent />;
  }
  return (
    <AppFilesContext.Provider value={appFilesData}>
      {siteStateContext.stopped && <AppStopBanner message={t('noAppFilesWhileFunctionAppStopped')} />}
      <AppFiles site={site} fileList={fileList} runtimeVersion={runtimeVersion} />}
    </AppFilesContext.Provider>
  );
};

export default AppFilesDataLoader;
