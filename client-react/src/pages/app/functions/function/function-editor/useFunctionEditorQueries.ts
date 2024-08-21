import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AppKeyService from '../../../../../ApiHelpers/AppKeysService';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import SiteService from '../../../../../ApiHelpers/SiteService';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { Host } from '../../../../../models/functions/host';
import { VfsObject } from '../../../../../models/functions/vfs';
import { SiteConfig } from '../../../../../models/site/config';
import { Site } from '../../../../../models/site/site';
import { PortalContext } from '../../../../../PortalContext';
import { CommonConstants, ExperimentationConstants } from '../../../../../utils/CommonConstants';
import { LogCategories } from '../../../../../utils/LogCategories';
import LogService from '../../../../../utils/LogService';
import { ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
import StringUtils from '../../../../../utils/string';
import { SiteRouterContext } from '../../../SiteRouter';
import { AppKeysInfo } from '../../app-keys/AppKeys.types';
import FunctionEditorData from './FunctionEditor.data';

type Status = 'idle' | 'loading' | 'success' | 'error';

export const isNewPythonProgrammingModel = (functionInfo?: ArmObj<FunctionInfo>): boolean => {
  const properties = functionInfo?.properties;

  return properties?.config_href === null && properties?.config.language === 'python';
};

export const useFunctionEditorQueries = (resourceId: string, functionEditorData: FunctionEditorData) => {
  const siteResourceId = useMemo(() => {
    const armSiteDescriptor = new ArmSiteDescriptor(resourceId);

    return armSiteDescriptor.getTrimmedResourceId();
  }, [resourceId]);

  const [updated, setUpdated] = useState(() => performance.now());

  const { enablePortalCall, isFunctionLogsApiFlightingEnabled, status: portalContextQueryStatus } = usePortalContextQuery(updated);
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
    isFunctionLogsApiFlightingEnabled,
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

  useEffect(() => {
    setStatus('loading');

    AppKeyService.fetchKeys(siteResourceId).then(response => {
      if (response.metadata.success) {
        setStatus('success');
        setHostKeys(response.data);
      } else {
        setStatus('error');

        LogService.error(
          LogCategories.FunctionEdit,
          'fetchAppKeys',
          `Failed to fetch app keys: ${getErrorMessageOrStringify(response.metadata.error)}`
        );
      }
    });
  }, [siteResourceId, updated]);

  return {
    hostKeys,
    status,
  };
};

const useAppSettingsQuery = (updated: number, siteResourceId: string) => {
  const [status, setStatus] = useState<Status>('idle');
  const [workerRuntime, setWorkerRuntime] = useState<string>();

  useEffect(() => {
    setStatus('loading');

    SiteService.fetchApplicationSettings(siteResourceId).then(response => {
      if (response.metadata.success) {
        setStatus('success');
        setWorkerRuntime(response.data.properties[CommonConstants.AppSettingNames.functionsWorkerRuntime]?.toLowerCase());
      } else {
        setStatus('error');

        LogService.error(
          LogCategories.FunctionEdit,
          'fetchAppSettings',
          `Failed to fetch app settings: ${getErrorMessageOrStringify(response.metadata.error)}`
        );
      }
    });
  }, [siteResourceId, updated]);

  return {
    status,
    workerRuntime,
  };
};

const useFileListQuery = (updated: number, siteResourceId: string, functionInfo?: ArmObj<FunctionInfo>, runtimeVersion?: string) => {
  // Get all files at VFS root for the new programming model with the function script pre-selected for viewing.
  const functionName = useMemo(() => {
    return isNewPythonProgrammingModel(functionInfo) ? '' : functionInfo?.properties.name;
  }, [functionInfo]);

  const [fileList, setFileList] = useState<VfsObject[]>();
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (functionName !== undefined && runtimeVersion) {
      setStatus('loading');

      FunctionsService.getFileContent(siteResourceId, functionName, runtimeVersion).then(response => {
        if (response.metadata.success) {
          setStatus('success');
          setFileList(response.data as VfsObject[]);
        } else {
          setStatus('error');

          LogService.error(
            LogCategories.FunctionEdit,
            'getFileContent',
            `Failed to get file content: ${getErrorMessageOrStringify(response.metadata.error)}`
          );
        }
      });
    } else {
      setStatus('idle');
    }
  }, [functionName, runtimeVersion, siteResourceId, updated]);

  return {
    fileList,
    setFileList,
    status,
  };
};

const useFunctionInfoQuery = (updated: number, resourceId: string, functionEditorData: FunctionEditorData) => {
  const [functionInfo, setFunctionInfo] = useState<ArmObj<FunctionInfo>>();
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    setStatus('loading');

    functionEditorData.getFunctionInfo(resourceId).then(response => {
      if (response.metadata.success) {
        setStatus('success');
        setFunctionInfo(response.data);
      } else {
        setStatus('error');

        LogService.error(
          LogCategories.FunctionEdit,
          'getFunction',
          `Failed to get function info: ${getErrorMessageOrStringify(response.metadata.error)}`
        );
      }
    });
  }, [functionEditorData, resourceId, updated]);

  return {
    functionInfo,
    setFunctionInfo,
    status,
  };
};

const useFunctionKeysQuery = (updated: number, resourceId: string) => {
  const [functionKeys, setFunctionKeys] = useState<Record<string, string>>();
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    setStatus('loading');

    FunctionsService.fetchKeys(resourceId).then(response => {
      if (response.metadata.success) {
        setStatus('success');
        setFunctionKeys(response.data);
      } else {
        setStatus('error');

        LogService.error(
          LogCategories.FunctionEdit,
          'fetchFunctionKeys',
          `Failed to fetch function keys: ${getErrorMessageOrStringify(response.metadata.error)}`
        );
      }
    });
  }, [resourceId, updated]);

  return {
    functionKeys,
    status,
  };
};

const useHostJsonQuery = (updated: number, siteResourceId: string, runtimeVersion?: string) => {
  const [hostJsonContent, setHostJsonContent] = useState<Host>();
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    setStatus('loading');

    if (runtimeVersion) {
      FunctionsService.getHostJson(siteResourceId, runtimeVersion).then(response => {
        if (response.metadata.success) {
          setStatus('success');
          setHostJsonContent(response.data);
        } else {
          setStatus('error');

          LogService.error(
            LogCategories.FunctionEdit,
            'getHostJson',
            `Failed to get host json file: ${getErrorMessageOrStringify(response.metadata.error)}`
          );
        }
      });
    } else {
      setStatus('idle');
    }
  }, [runtimeVersion, siteResourceId, updated]);

  return {
    hostJsonContent,
    status,
  };
};

const useHostStatusQuery = (updated: number, siteResourceId: string) => {
  const [runtimeVersion, setRuntimeVersion] = useState<string>();
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    setStatus('loading');

    SiteService.fetchFunctionsHostStatus(siteResourceId).then(response => {
      if (response.metadata.success) {
        const currentRuntimeVersion = StringUtils.getRuntimeVersionString(response.data.properties.version);

        setStatus('success');
        setRuntimeVersion(currentRuntimeVersion);
      } else {
        setStatus('error');

        LogService.error(
          LogCategories.FunctionEdit,
          'fetchFunctionsHostStatus',
          `Failed to fetch host status: ${getErrorMessageOrStringify(response.metadata.error)}`
        );
      }
    });
  }, [siteResourceId, updated]);

  return {
    runtimeVersion,
    status,
  };
};

const usePortalContextQuery = (updated: number) => {
  const context = useContext(PortalContext);
  const [enablePortalCall, setEnablePortalCall] = useState<boolean>();
  const [isFunctionLogsApiFlightingEnabled, setIsFunctionLogsApiFlightingEnabled] = useState<boolean>();
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    setStatus('loading');

    Promise.all([
      context.hasFlightEnabled(ExperimentationConstants.TreatmentFlight.newFunctionLogsApi),
      context.hasFlightEnabled(ExperimentationConstants.TreatmentFlight.portalCallOnEditor),
    ])
      .then(([newFunctionLogicApi, portalCallOnEditor]) => {
        setStatus('success');
        setIsFunctionLogsApiFlightingEnabled(newFunctionLogicApi);
        setEnablePortalCall(portalCallOnEditor);
      })
      .catch(() => {
        setStatus('error');
      });
  }, [context, updated]);

  return {
    enablePortalCall,
    isFunctionLogsApiFlightingEnabled,
    status,
  };
};

const useSiteQuery = (updated: number, siteResourceId: string) => {
  const context = useContext(SiteRouterContext);
  const [site, setSite] = useState<ArmObj<Site>>();
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    setStatus('loading');

    context.fetchSite(siteResourceId).then(response => {
      if (response.metadata.success) {
        setStatus('success');
        setSite(response.data);
      } else {
        setStatus('error');

        LogService.error(
          LogCategories.FunctionEdit,
          'fetchSite',
          `Failed to fetch site: ${getErrorMessageOrStringify(response.metadata.error)}`
        );
      }
    });
  }, [context, siteResourceId, updated]);

  return {
    site,
    status,
  };
};

const useSiteConfigQuery = (updated: number, siteResourceId: string, functionEditorData: FunctionEditorData) => {
  const [siteConfig, setSiteConfig] = useState<ArmObj<SiteConfig>>();
  const [status, setStatus] = useState<Status>('idle');

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

        LogService.error(
          LogCategories.FunctionEdit,
          'fetchSiteConfig',
          `Failed to fetch site-config: ${getErrorMessageOrStringify(response.metadata.error)}`
        );
      }
    });
  }, [functionEditorData, siteResourceId, updated]);

  return {
    siteConfig,
    status,
  };
};
