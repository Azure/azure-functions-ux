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
import { ValidationRegex } from '../../../../utils/constants/ValidationRegex';
import { PortalContext } from '../../../../PortalContext';
import { getTelemetryInfo } from '../../../../utils/TelemetryUtils';

interface AppFilesDataLoaderProps {
  resourceId: string;
}

const appFilesData = new AppFilesData();
export const AppFilesContext = React.createContext(appFilesData);
export type Status = 'loading' | 'success' | 'error' | 'unauthorized';

const AppFilesDataLoader: React.FC<AppFilesDataLoaderProps> = props => {
  const { resourceId } = props;
  const [initialLoading, setInitialLoading] = useState(true);
  const [site, setSite] = useState<ArmObj<Site> | undefined>(undefined);
  const [runtimeVersion, setRuntimeVersion] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [fileList, setFileList] = useState<VfsObject[] | undefined>(undefined);
  const [fileContentsStatus, setFileContentStatus] = useState<Status>('success');

  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);

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
      setFileContentStatus('loading');
      const fileListResponse = await FunctionsService.getFileContent(resourceId, undefined, currentRuntimeVersion);
      if (fileListResponse.metadata.success) {
        setFileContentStatus('success');
        setFileList(fileListResponse.data as VfsObject[]);
      } else {
        if (fileListResponse.metadata.status === 401) {
          setFileContentStatus('unauthorized');
        } else {
          setFileContentStatus('error');
        }

        setFileList(undefined);
        portalContext.log(
          getTelemetryInfo('error', 'getFileContent', 'failed', {
            error: fileListResponse.metadata.error,
            message: 'Failed to get file list',
          })
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
      <AppFiles
        site={site}
        fileList={fileList}
        runtimeVersion={runtimeVersion}
        refreshFunction={refresh}
        isRefreshing={isRefreshing}
        fileContentStatus={fileContentsStatus}
      />
    </AppFilesContext.Provider>
  );
};

export default AppFilesDataLoader;
