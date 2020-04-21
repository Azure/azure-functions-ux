import React, { useEffect, useState, useContext } from 'react';
import AppFilesData from './AppFiles.data';
import AppFiles from './AppFiles';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import SiteService from '../../../../ApiHelpers/SiteService';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { VfsObject } from '../../../../models/functions/vfs';
import { SiteStateContext } from '../../../../SiteState';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { useTranslation } from 'react-i18next';
import { ValidationRegex } from '../../../../utils/constants/ValidationRegex';
import { MessageBarType } from 'office-ui-fabric-react';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getErrorMessageOrStringify } from '../../../../ApiHelpers/ArmHelper';

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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [fileList, setFileList] = useState<VfsObject[] | undefined>(undefined);

  const siteStateContext = useContext(SiteStateContext);

  const { t } = useTranslation();

  const fetchData = async () => {
    const [siteResponse, hostStatusResponse] = await Promise.all([
      SiteService.fetchSite(resourceId),
      SiteService.fetchFunctionsHostStatus(resourceId),
    ]);
    if (siteResponse.metadata.success) {
      setSite(siteResponse.data);
    }
    if (hostStatusResponse.metadata.success) {
      const hostStatusData = hostStatusResponse.data;
      const currentRuntimeVersion = getRuntimeVersionString(hostStatusData.properties.version);
      setRuntimeVersion(currentRuntimeVersion);
      const fileListResponse = await FunctionsService.getFileContent(resourceId, undefined, currentRuntimeVersion);
      if (fileListResponse.metadata.success) {
        setFileList(fileListResponse.data as VfsObject[]);
      } else {
        LogService.error(
          LogCategories.appFiles,
          'getFileList',
          `Failed to get file list: ${getErrorMessageOrStringify(fileListResponse.metadata.error)}`
        );
      }
    }

    setInitialLoading(false);
    setIsRefreshing(false);
  };

  const getRuntimeVersionString = (exactVersion: string): string => {
    if (ValidationRegex.runtimeVersion.test(exactVersion)) {
      const versionElements = exactVersion.split('.');
      return `~${versionElements[0]}`;
    }
    return exactVersion;
  };

  const refresh = () => {
    setIsRefreshing(true);
    fetchData();
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
      {siteStateContext.stopped && <CustomBanner message={t('noAppFilesWhileFunctionAppStopped')} type={MessageBarType.warning} />}
      <AppFiles site={site} fileList={fileList} runtimeVersion={runtimeVersion} refreshFunction={refresh} isRefreshing={isRefreshing} />}
    </AppFilesContext.Provider>
  );
};

export default AppFilesDataLoader;
