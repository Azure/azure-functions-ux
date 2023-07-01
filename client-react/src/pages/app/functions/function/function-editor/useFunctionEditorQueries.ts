import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import AppKeyService from '../../../../../ApiHelpers/AppKeysService';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import SiteService from '../../../../../ApiHelpers/SiteService';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { Host } from '../../../../../models/functions/host';
import { VfsObject } from '../../../../../models/functions/vfs';
import { SiteConfig } from '../../../../../models/site/config';
import { Site } from '../../../../../models/site/site';
import { PortalContext } from '../../../../../PortalContext';
import { CommonConstants, ExperimentationConstants, WorkerRuntimeLanguages } from '../../../../../utils/CommonConstants';
import { ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
import StringUtils from '../../../../../utils/string';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import { SiteRouterContext } from '../../../SiteRouter';
import { AppKeysInfo } from '../../app-keys/AppKeys.types';

import FunctionEditorData from './FunctionEditor.data';

export type Status = 'idle' | 'loading' | 'success' | 'error' | 'unauthorized';

export const isDotNetIsolatedFunction = (functionInfo?: ArmObj<FunctionInfo>): boolean => {
  return functionInfo?.properties.config.language === WorkerRuntimeLanguages.dotnetIsolated;
};

export const isNewProgrammingModel = (functionInfo?: ArmObj<FunctionInfo>): boolean => {
  return isNewNodeProgrammingModel(functionInfo) || isNewPythonProgrammingModel(functionInfo);
};

export const isNewNodeProgrammingModel = (functionInfo?: ArmObj<FunctionInfo>): boolean => {
  const properties = functionInfo?.properties;
  return properties?.config_href === null && properties?.config.language === WorkerRuntimeLanguages.nodejs;
};

export const isNewPythonProgrammingModel = (functionInfo?: ArmObj<FunctionInfo>): boolean => {
  const properties = functionInfo?.properties;
  return properties?.config_href === null && properties?.config.language === WorkerRuntimeLanguages.python;
};

// Currently, Node is the only new programming model which supports storing files in any folder.
// Therefore, we need to check 'functionDirectory' property to decide where to get files.
export const getFunctionDirectory = (functionInfo?: ArmObj<FunctionInfo>): string => {
  const functionDirectory = functionInfo?.properties.config.functionDirectory;
  if (isNewNodeProgrammingModel(functionInfo) && functionDirectory) {
    // It should always contain 'wwwroot' and a folder name is always after 'wwwroot'.
    const arr = functionDirectory.split(CommonConstants.wwwrootFolder);
    return arr[arr.length - 1].replaceAll('\\', '/');
  }

  //.NET Isolated function apps store their files in the root folder.
  if (isDotNetIsolatedFunction(functionInfo)) {
    return '/';
  }

  return '';
};

export const useFunctionEditorQueries = (resourceId: string, functionEditorData: FunctionEditorData) => {
  const siteResourceId = useMemo(() => {
    const armSiteDescriptor = new ArmSiteDescriptor(resourceId);

    return armSiteDescriptor.getTrimmedResourceId();
  }, [resourceId]);

  const [updated, setUpdated] = useState(() => performance.now());

  const { enablePortalCall, status: portalContextQueryStatus } = usePortalContextQuery(updated);
  const { status: appSettingsQueryStatus, workerRuntime } = useAppSettingsQuery(updated, siteResourceId);
  const { site, status: siteQueryStatus } = useSiteQuery(updated, siteResourceId);
  const { functionInfo, setFunctionInfo, status: functionInfoQueryStatus } = useFunctionInfoQuery(updated, resourceId, functionEditorData);
  const { runtimeVersion, status: hostStatusQueryStatus } = useHostStatusQuery(updated, siteResourceId);
  const { fileList, setFileList, status: fileListQueryStatus } = useFileListQuery(updated, siteResourceId, functionInfo, runtimeVersion);
  const { hostJsonContent, status: hostJsonQueryStatus } = useHostJsonQuery(updated, siteResourceId, runtimeVersion);
  const { hostKeys, status: appKeysQueryStatus } = useAppKeysQuery(updated, siteResourceId);
  const { functionKeys, status: functionKeysQueryStatus } = useFunctionKeysQuery(updated, resourceId);
  const { siteConfig, status: siteConfigQueryStatus } = useSiteConfigQuery(updated, siteResourceId, functionEditorData);

  const status = useMemo<Status>(() => {
    const statuses = [
      appKeysQueryStatus,
      appSettingsQueryStatus,
      fileListQueryStatus,
      functionInfoQueryStatus,
      functionKeysQueryStatus,
      hostJsonQueryStatus,
      hostStatusQueryStatus,
      portalContextQueryStatus,
      siteConfigQueryStatus,
      siteQueryStatus,
    ];

    if (statuses.some(status => status === 'loading')) {
      return 'loading';
    } else if (statuses.some(status => status === 'error')) {
      return 'error';
    } else if (statuses.every(status => status === 'success')) {
      return 'success';
    } else {
      return 'idle';
    }
  }, [
    appKeysQueryStatus,
    appSettingsQueryStatus,
    fileListQueryStatus,
    functionInfoQueryStatus,
    functionKeysQueryStatus,
    hostJsonQueryStatus,
    hostStatusQueryStatus,
    portalContextQueryStatus,
    siteConfigQueryStatus,
    siteQueryStatus,
  ]);

  const refreshQueries = useCallback(() => {
    setUpdated(performance.now());
  }, []);

  return {
    enablePortalCall,
    fileList,
    functionInfo,
    functionKeys,
    hostJsonContent,
    hostKeys,
    refreshQueries,
    runtimeVersion,
    setFileList,
    setFunctionInfo,
    site,
    siteConfig,
    status,
    workerRuntime,
  };
};

const useAppKeysQuery = (updated: number, siteResourceId: string) => {
  const [hostKeys, setHostKeys] = useState<AppKeysInfo>();
  const [status, setStatus] = useState<Status>('idle');

  const portalContext = useContext(PortalContext);

  useEffect(() => {
    setStatus('loading');

    AppKeyService.fetchKeys(siteResourceId).then(response => {
      if (response.metadata.success) {
        setStatus('success');
        setHostKeys(response.data);
      } else {
        setStatus('error');
        portalContext.log(
          getTelemetryInfo('error', 'fetchAppKeys', 'failed', {
            error: response.metadata.error,
            message: 'Failed to fetch app keys',
          })
        );
      }
    });
  }, [portalContext, siteResourceId, updated]);

  return {
    hostKeys,
    status,
  };
};

const useAppSettingsQuery = (updated: number, siteResourceId: string) => {
  const [status, setStatus] = useState<Status>('idle');
  const [workerRuntime, setWorkerRuntime] = useState<string>();

  const portalContext = useContext(PortalContext);

  useEffect(() => {
    setStatus('loading');

    SiteService.fetchApplicationSettings(siteResourceId).then(response => {
      if (response.metadata.success) {
        setStatus('success');
        setWorkerRuntime(response.data.properties[CommonConstants.AppSettingNames.functionsWorkerRuntime]?.toLowerCase());
      } else {
        setStatus('error');
        portalContext.log(
          getTelemetryInfo('error', 'fetchAppSettings', 'failed', {
            error: response.metadata.error,
            message: 'Failed to fetch app settings',
          })
        );
      }
    });
  }, [portalContext, siteResourceId, updated]);

  return {
    status,
    workerRuntime,
  };
};

const useFileListQuery = (updated: number, siteResourceId: string, functionInfo?: ArmObj<FunctionInfo>, runtimeVersion?: string) => {
  // Get all files at VFS root for the new programming model with the function script pre-selected for viewing.
  const functionName = useMemo(() => {
    return isNewProgrammingModel(functionInfo) ? '' : functionInfo?.properties.name;
  }, [functionInfo]);

  const functionDirectory = useMemo(() => getFunctionDirectory(functionInfo), [functionInfo]);

  const [fileList, setFileList] = useState<VfsObject[]>();
  const [status, setStatus] = useState<Status>('idle');

  const portalContext = useContext(PortalContext);

  useEffect(() => {
    if (functionName !== undefined && runtimeVersion) {
      setStatus('loading');

      FunctionsService.getFileContent(siteResourceId, functionName, runtimeVersion, undefined, undefined, functionDirectory).then(
        response => {
          if (response.metadata.success) {
            setStatus('success');
            setFileList(response.data as VfsObject[]);
          } else {
            if (response.metadata.status === 401) {
              setStatus('unauthorized');
            } else {
              setStatus('error');
            }
            portalContext.log(
              getTelemetryInfo('error', 'getFileContent', 'failed', {
                error: response.metadata.error,
                message: 'Failed to get file content',
              })
            );
          }
        }
      );
    } else {
      setStatus('idle');
    }
  }, [functionName, functionDirectory, portalContext, runtimeVersion, siteResourceId, updated]);

  return {
    fileList,
    setFileList,
    status,
  };
};

const useFunctionInfoQuery = (updated: number, resourceId: string, functionEditorData: FunctionEditorData) => {
  const [functionInfo, setFunctionInfo] = useState<ArmObj<FunctionInfo>>();
  const [status, setStatus] = useState<Status>('idle');

  const portalContext = useContext(PortalContext);

  useEffect(() => {
    setStatus('loading');

    functionEditorData.getFunctionInfo(resourceId).then(response => {
      if (response.metadata.success) {
        setStatus('success');
        setFunctionInfo(response.data);
      } else {
        setStatus('error');
        portalContext.log(
          getTelemetryInfo('error', 'getFunction', 'failed', {
            error: response.metadata.error,
            message: 'Failed to get function info',
          })
        );
      }
    });
  }, [functionEditorData, portalContext, resourceId, updated]);

  return {
    functionInfo,
    setFunctionInfo,
    status,
  };
};

const useFunctionKeysQuery = (updated: number, resourceId: string) => {
  const [functionKeys, setFunctionKeys] = useState<Record<string, string>>();
  const [status, setStatus] = useState<Status>('idle');

  const portalContext = useContext(PortalContext);

  useEffect(() => {
    setStatus('loading');

    FunctionsService.fetchKeys(resourceId).then(response => {
      if (response.metadata.success) {
        setStatus('success');
        setFunctionKeys(response.data);
      } else {
        setStatus('error');
        portalContext.log(
          getTelemetryInfo('error', 'fetchFunctionKeys', 'failed', {
            error: response.metadata.error,
            message: 'Failed to fetch function keys',
          })
        );
      }
    });
  }, [portalContext, resourceId, updated]);

  return {
    functionKeys,
    status,
  };
};

const useHostJsonQuery = (updated: number, siteResourceId: string, runtimeVersion?: string) => {
  const [hostJsonContent, setHostJsonContent] = useState<Host>();
  const [status, setStatus] = useState<Status>('idle');

  const portalContext = useContext(PortalContext);

  useEffect(() => {
    setStatus('loading');

    if (runtimeVersion) {
      FunctionsService.getHostJson(siteResourceId, runtimeVersion).then(response => {
        if (response.metadata.success) {
          setStatus('success');
          setHostJsonContent(response.data);
        } else {
          if (response.metadata.status === 401) {
            setStatus('unauthorized');
          } else {
            setStatus('error');
          }
          portalContext.log(
            getTelemetryInfo('error', 'getHostJson', 'failed', {
              error: response.metadata.error,
              message: 'Failed to get host json file',
            })
          );
        }
      });
    } else {
      setStatus('idle');
    }
  }, [portalContext, runtimeVersion, siteResourceId, updated]);

  return {
    hostJsonContent,
    status,
  };
};

const useHostStatusQuery = (updated: number, siteResourceId: string) => {
  const [runtimeVersion, setRuntimeVersion] = useState<string>();
  const [status, setStatus] = useState<Status>('idle');

  const portalContext = useContext(PortalContext);

  useEffect(() => {
    setStatus('loading');

    SiteService.fetchFunctionsHostStatus(siteResourceId).then(response => {
      if (response.metadata.success) {
        const currentRuntimeVersion = StringUtils.getRuntimeVersionString(response.data.properties.version);

        setStatus('success');
        setRuntimeVersion(currentRuntimeVersion);
      } else {
        setStatus('error');
        portalContext.log(
          getTelemetryInfo('error', 'fetchFunctionHostStatus', 'failed', {
            error: response.metadata.error,
            message: 'Failed to fetch host status',
          })
        );
      }
    });
  }, [portalContext, siteResourceId, updated]);

  return {
    runtimeVersion,
    status,
  };
};

const usePortalContextQuery = (updated: number) => {
  const context = useContext(PortalContext);
  const [enablePortalCall, setEnablePortalCall] = useState<boolean>();
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    setStatus('loading');

    context
      .hasFlightEnabled(ExperimentationConstants.TreatmentFlight.portalCallOnEditor)
      .then(portalCallOnEditor => {
        setStatus('success');
        setEnablePortalCall(portalCallOnEditor);
      })
      .catch(() => {
        setStatus('error');
      });
  }, [context, updated]);

  return {
    enablePortalCall,
    status,
  };
};

const useSiteQuery = (updated: number, siteResourceId: string) => {
  const context = useContext(SiteRouterContext);
  const [site, setSite] = useState<ArmObj<Site>>();
  const [status, setStatus] = useState<Status>('idle');

  const portalContext = useContext(PortalContext);

  useEffect(() => {
    setStatus('loading');

    context.fetchSite(siteResourceId).then(response => {
      if (response.metadata.success) {
        setStatus('success');
        setSite(response.data);
      } else {
        setStatus('error');
        portalContext.log(
          getTelemetryInfo('error', 'fetchSite', 'failed', {
            error: response.metadata.error,
            message: 'Failed to fetch site',
          })
        );
      }
    });
  }, [context, portalContext, siteResourceId, updated]);

  return {
    site,
    status,
  };
};

const useSiteConfigQuery = (updated: number, siteResourceId: string, functionEditorData: FunctionEditorData) => {
  const [siteConfig, setSiteConfig] = useState<ArmObj<SiteConfig>>();
  const [status, setStatus] = useState<Status>('idle');

  const portalContext = useContext(PortalContext);

  useEffect(() => {
    setStatus('loading');

    SiteService.fetchWebConfig(siteResourceId).then(response => {
      if (response.metadata.success) {
        const webConfig = response.data;

        setStatus('success');
        setSiteConfig(webConfig);

        functionEditorData.functionData = {
          siteConfig: webConfig,
        };
      } else {
        setStatus('error');
        portalContext.log(
          getTelemetryInfo('error', 'fetchSiteConfig', 'failed', {
            error: response.metadata.error,
            message: 'Failed to fetch site-config',
          })
        );
      }
    });
  }, [functionEditorData, portalContext, siteResourceId, updated]);

  return {
    siteConfig,
    status,
  };
};
