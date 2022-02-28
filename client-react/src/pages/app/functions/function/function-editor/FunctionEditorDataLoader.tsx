import React, { useState, useEffect, useContext } from 'react';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import { FunctionEditor } from './FunctionEditor';
import { ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
import FunctionEditorData from './FunctionEditor.data';
import { Site } from '../../../../../models/site/site';
import { SiteRouterContext } from '../../../SiteRouter';
import Url from '../../../../../utils/url';
import { NameValuePair, ResponseContent, UrlObj, UrlType, urlParameterRegExp } from './FunctionEditor.types';
import AppKeyService from '../../../../../ApiHelpers/AppKeysService';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { BindingManager } from '../../../../../utils/BindingManager';
import { AppKeysInfo } from '../../app-keys/AppKeys.types';
import SiteService from '../../../../../ApiHelpers/SiteService';
import { RuntimeExtensionMajorVersions, RuntimeExtensionCustomVersions } from '../../../../../models/functions/runtime-extension';
import { Host } from '../../../../../models/functions/host';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { VfsObject } from '../../../../../models/functions/vfs';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import { shrinkEditorStyle } from './FunctionEditor.styles';
import { KeyValue } from '../../../../../models/portal-models';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';
import StringUtils from '../../../../../utils/string';
import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import { MessageBarType } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import { CommonConstants, ExperimentationConstants } from '../../../../../utils/CommonConstants';
import { NetAjaxSettings } from '../../../../../models/ajax-request-model';
import { PortalContext } from '../../../../../PortalContext';
import { getJQXHR, isPortalCommunicationStatusSuccess } from '../../../../../utils/portal-utils';
import { getJsonHeaders } from '../../../../../ApiHelpers/HttpClient';
import { SiteStateContext } from '../../../../../SiteState';
import SiteHelper from '../../../../../utils/SiteHelper';
import { Method } from 'axios';

interface FunctionEditorDataLoaderProps {
  resourceId: string;
}

const functionEditorData = new FunctionEditorData();
export const FunctionEditorContext = React.createContext(functionEditorData);

const FunctionEditorDataLoader: React.FC<FunctionEditorDataLoaderProps> = props => {
  const { resourceId } = props;
  const [initialLoading, setInitialLoading] = useState(true);
  const [site, setSite] = useState<ArmObj<Site> | undefined>(undefined);
  const [functionInfo, setFunctionInfo] = useState<ArmObj<FunctionInfo> | undefined>(undefined);
  const [hostKeys, setHostKeys] = useState<AppKeysInfo | undefined>(undefined);
  const [functionKeys, setFunctionKeys] = useState<KeyValue<string>>({});
  const [runtimeVersion, setRuntimeVersion] = useState<string | undefined>(undefined);
  const [hostJsonContent, setHostJsonContent] = useState<Host | undefined>(undefined);
  const [fileList, setFileList] = useState<VfsObject[] | undefined>(undefined);
  const [responseContent, setResponseContent] = useState<ResponseContent | undefined>(undefined);
  const [functionRunning, setFunctionRunning] = useState(false);
  const [hostUrls, setHostUrls] = useState<UrlObj[]>([]);
  const [systemUrls, setSystemUrls] = useState<UrlObj[]>([]);
  const [functionUrls, setFunctionUrls] = useState<UrlObj[]>([]);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testData, setTestData] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [workerRuntime, setWorkerRuntime] = useState<string | undefined>(undefined);
  const [enablePortalCall, setEnablePortalCall] = useState(false);
  const [isLinuxSkuFlightingEnabled, setIsLinuxSkuFlightingEnabled] = useState(false);

  const siteContext = useContext(SiteRouterContext);
  const siteStateContext = useContext(SiteStateContext);
  const startupInfoContext = useContext(StartupInfoContext);
  const portalContext = useContext(PortalContext);

  const { t } = useTranslation();

  const isHttpOrWebHookFunction = !!functionInfo && functionEditorData.isHttpOrWebHookFunction(functionInfo);

  const getSiteResourceId = () => {
    const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
    return armSiteDescriptor.getTrimmedResourceId();
  };

  const fetchData = async () => {
    const siteResourceId = getSiteResourceId();
    const [
      siteResponse,
      functionInfoResponse,
      appKeysResponse,
      functionKeysResponse,
      hostStatusResponse,
      enablePortalCall,
      isLinuxSkuFlightingEnabled,
    ] = await Promise.all([
      siteContext.fetchSite(siteResourceId),
      functionEditorData.getFunctionInfo(resourceId),
      AppKeyService.fetchKeys(siteResourceId),
      FunctionsService.fetchKeys(resourceId),
      SiteService.fetchFunctionsHostStatus(siteResourceId),
      portalContext.hasFlightEnabled(ExperimentationConstants.TreatmentFlight.portalCallOnEditor),
      portalContext.hasFlightEnabled(ExperimentationConstants.TreatmentFlight.linuxPortalEditing),
    ]);

    setEnablePortalCall(enablePortalCall);
    setIsLinuxSkuFlightingEnabled(isLinuxSkuFlightingEnabled);

    // NOTE (krmitta): App-Settings are going to be used to fetch the workerRuntime,
    // for logging purposes only. Thus we are not going to block on this.
    fetchAppSettings(siteResourceId);

    if (siteResponse.metadata.success) {
      setSite(siteResponse.data);
    } else {
      LogService.error(
        LogCategories.FunctionEdit,
        'fetchSite',
        `Failed to fetch site: ${getErrorMessageOrStringify(siteResponse.metadata.error)}`
      );
    }

    if (functionInfoResponse.metadata.success) {
      setFunctionInfo(functionInfoResponse.data);
    } else {
      LogService.error(
        LogCategories.FunctionEdit,
        'getFunction',
        `Failed to get function info: ${getErrorMessageOrStringify(functionInfoResponse.metadata.error)}`
      );
    }

    if (hostStatusResponse.metadata.success) {
      const hostStatusData = hostStatusResponse.data;
      const currentRuntimeVersion = StringUtils.getRuntimeVersionString(hostStatusData.properties.version);
      setRuntimeVersion(currentRuntimeVersion);
      const [hostJsonResponse, fileListResponse] = await Promise.all([
        FunctionsService.getHostJson(siteResourceId, currentRuntimeVersion),
        FunctionsService.getFileContent(siteResourceId, functionInfoResponse.data.properties.name, currentRuntimeVersion),
      ]);
      if (hostJsonResponse && hostJsonResponse.metadata.success) {
        setHostJsonContent(hostJsonResponse.data);
      } else {
        LogService.error(
          LogCategories.FunctionEdit,
          'getHostJson',
          `Failed to get host json file: ${getErrorMessageOrStringify(hostJsonResponse.metadata.error)}`
        );
      }

      if (fileListResponse && fileListResponse.metadata.success) {
        setFileList(fileListResponse.data as VfsObject[]);
      } else {
        LogService.error(
          LogCategories.FunctionEdit,
          'getFileContent',
          `Failed to get file content: ${getErrorMessageOrStringify(fileListResponse.metadata.error)}`
        );
      }
    }

    if (appKeysResponse.metadata.success) {
      setHostKeys(appKeysResponse.data);
    } else {
      LogService.error(
        LogCategories.FunctionEdit,
        'fetchAppKeys',
        `Failed to fetch app keys: ${getErrorMessageOrStringify(appKeysResponse.metadata.error)}`
      );
    }

    if (functionKeysResponse.metadata.success) {
      setFunctionKeys(functionKeysResponse.data);
    } else {
      LogService.error(
        LogCategories.FunctionEdit,
        'fetchFunctionKeys',
        `Failed to fetch function keys: ${getErrorMessageOrStringify(functionKeysResponse.metadata.error)}`
      );
    }

    await getAndUpdateSiteConfig();

    setInitialLoading(false);
    setIsRefreshing(false);
  };

  const fetchAppSettings = async (siteResourceId: string) => {
    const appSettingsResponse = await SiteService.fetchApplicationSettings(siteResourceId);

    if (appSettingsResponse.metadata.success) {
      const appSettingsProperties = appSettingsResponse.data.properties;
      if (appSettingsProperties.hasOwnProperty(CommonConstants.AppSettingNames.functionsWorkerRuntime)) {
        setWorkerRuntime(appSettingsProperties[CommonConstants.AppSettingNames.functionsWorkerRuntime].toLowerCase());
      }
    } else {
      LogService.error(
        LogCategories.FunctionEdit,
        'fetchAppSettings',
        `Failed to fetch app settings: ${getErrorMessageOrStringify(appSettingsResponse.metadata.error)}`
      );
    }
  };

  const createAndGetFunctionInvokeUrlPath = (key?: string) => {
    if (functionInfo) {
      const httpTriggerTypeInfo = BindingManager.getHttpTriggerTypeInfo(functionInfo.properties);
      const webHookTypeInfoInfo = BindingManager.getWebHookTypeInfo(functionInfo.properties);
      const authLevelInfo = BindingManager.getAuthLevelInfo(functionInfo.properties);
      if (httpTriggerTypeInfo) {
        let code = '';
        let clientId = '';
        const queryParams: string[] = [];
        const result = getResultFromHostJson();
        const functionKey = key || functionKeys.default;

        code = !!functionKey ? functionKey : '';

        if (!!webHookTypeInfoInfo && functionKey) {
          if (hostKeys) {
            const allKeys = { ...hostKeys.functionKeys, ...hostKeys.systemKeys };
            const keyWithValue = Object.keys(allKeys).find(k => allKeys[k] === functionKey);
            clientId = !!keyWithValue ? keyWithValue : '';
          }
          if (webHookTypeInfoInfo.webHookType.toLowerCase() !== 'genericjson') {
            code = '';
          }
        }

        if (authLevelInfo && authLevelInfo.authLevel.toLowerCase() === 'anonymous') {
          code = '';
        }

        if (code) {
          queryParams.push(`code=${code}`);
        }

        if (clientId) {
          queryParams.push(`clientId=${clientId}`);
        }
        return getFunctionInvokeUrlPath(result, queryParams);
      }
    } else {
      LogService.error(
        LogCategories.functionInvokeUrl,
        'GetFunctionInvokeUrl',
        `No function Info found for the site: ${JSON.stringify(site)}`
      );
    }
    return '';
  };

  const getResultFromHostJson = (): string => {
    let result = '';
    switch (runtimeVersion) {
      case RuntimeExtensionMajorVersions.v1: {
        result =
          hostJsonContent &&
          hostJsonContent.http &&
          hostJsonContent.http.routePrefix !== undefined &&
          hostJsonContent.http.routePrefix !== null
            ? hostJsonContent.http.routePrefix
            : 'api';
        break;
      }
      case RuntimeExtensionCustomVersions.beta:
      case RuntimeExtensionMajorVersions.v2:
      case RuntimeExtensionMajorVersions.v3:
      case RuntimeExtensionMajorVersions.v4:
      default: {
        result =
          hostJsonContent &&
          hostJsonContent.extensions &&
          hostJsonContent.extensions.http &&
          hostJsonContent.extensions.http.routePrefix !== undefined &&
          hostJsonContent.extensions.http.routePrefix !== null
            ? hostJsonContent.extensions.http.routePrefix
            : 'api';
        break;
      }
    }
    return result;
  };

  const getFunctionInvokeUrlPath = (result: string, queryParams: string[]) => {
    if (functionInfo) {
      let path = '/';
      const httpTriggerTypeInfo = BindingManager.getHttpTriggerTypeInfo(functionInfo.properties);
      if (httpTriggerTypeInfo && httpTriggerTypeInfo.route) {
        path += `${result}/${httpTriggerTypeInfo.route}`;
      } else {
        path += `${result}/${functionInfo.properties.name}`;
      }

      // Remove doubled slashes
      const re = new RegExp('//', 'g');
      path = path.replace(re, '/').replace('/?', '?');
      path = `${path}${path.endsWith('?') ? '' : '?'}${queryParams.join('&')}`;
      return path.endsWith('?') ? path.slice(0, -1) : path;
    }
    return '';
  };

  const getHeaders = (testHeaders: NameValuePair[], xFunctionKey?: string): KeyValue<string> => {
    const headers = getJsonHeaders();
    testHeaders.forEach(h => {
      headers[h.name] = h.value;
    });

    if (hostKeys && hostKeys.masterKey) {
      headers['Cache-Control'] = 'no-cache';
      headers['x-functions-key'] = !!xFunctionKey ? getXFunctionKeyValue(xFunctionKey) : hostKeys.masterKey;
    }
    return headers;
  };

  // Used to get settings for both http and webHook functions
  const getSettingsToInvokeHttpFunction = (
    newFunctionInfo: ArmObj<FunctionInfo>,
    xFunctionKey?: string,
    liveLogsSessionId?: string
  ): NetAjaxSettings | undefined => {
    if (!!site) {
      let url = `${Url.getMainUrl(site)}${createAndGetFunctionInvokeUrlPath()}`;
      let parsedTestData = {};
      try {
        parsedTestData = JSON.parse(newFunctionInfo.properties.test_data);
      } catch (err) {
        parsedTestData = { body: newFunctionInfo.properties.test_data };
      }
      const testDataObject = functionEditorData.getProcessedFunctionTestData(parsedTestData);
      const queries = testDataObject.queries;

      const matchesPathParams = url.match(urlParameterRegExp);
      const processedParams: string[] = [];
      if (matchesPathParams) {
        matchesPathParams.forEach(m => {
          const name = m
            .split(':')[0]
            .replace('{', '')
            .replace('}', '')
            .toLowerCase();
          processedParams.push(name);
          const param = queries.find(p => {
            return p.name.toLowerCase() === name;
          });

          if (param) {
            url = url.replace(m, param.value);
          }
        });
      }

      const filteredQueryParams = queries.filter(query => {
        return !processedParams.find(p => p === query.name);
      });
      const queryString = getQueryString(filteredQueryParams);
      if (!!queryString) {
        url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
      }

      const headers = getHeaders(testDataObject.headers, xFunctionKey);

      return {
        uri: url,
        type: testDataObject.method as string,
        headers: { ...headers, ...getHeadersForLiveLogsSessionId(liveLogsSessionId) },
        data: testDataObject.body,
      };
    }
    return undefined;
  };

  // Used to get settings for non-http and non-webHook functions
  const getSettingsToInvokeNonHttpFunction = (
    newFunctionInfo: ArmObj<FunctionInfo>,
    xFunctionKey?: string,
    liveLogsSessionId?: string
  ): NetAjaxSettings | undefined => {
    if (!!site) {
      const url = `${Url.getMainUrl(site)}/admin/functions/${newFunctionInfo.properties.name.toLowerCase()}`;
      const headers = getHeaders([], xFunctionKey);

      return {
        uri: url,
        type: 'POST',
        headers: { ...headers, ...getHeadersForLiveLogsSessionId(liveLogsSessionId) },
        data: { input: newFunctionInfo.properties.test_data || '' },
      };
    }
    return undefined;
  };

  const getHeadersForLiveLogsSessionId = (liveLogsSessionId?: string) => {
    return { '#AzFuncLiveLogsSessionId': liveLogsSessionId || '' };
  };

  const run = async (newFunctionInfo: ArmObj<FunctionInfo>, xFunctionKey?: string, liveLogsSessionId?: string) => {
    setFunctionRunning(true);

    if (!SiteHelper.isFunctionAppReadOnly(siteStateContext.siteAppEditState)) {
      const updatedFunctionInfo = await functionEditorData.updateFunctionInfo(resourceId, newFunctionInfo);
      if (updatedFunctionInfo.metadata.success) {
        setFunctionInfo(updatedFunctionInfo.data);
      }
    }

    let settings: NetAjaxSettings | undefined;

    if (isHttpOrWebHookFunction) {
      settings = getSettingsToInvokeHttpFunction(newFunctionInfo, xFunctionKey, liveLogsSessionId);
    } else {
      settings = getSettingsToInvokeNonHttpFunction(newFunctionInfo, xFunctionKey, liveLogsSessionId);
    }

    if (!!settings) {
      let response: ResponseContent = { code: 0, text: '' };

      if (enablePortalCall) {
        response = await runUsingPortal(settings);
      } else {
        response = await runUsingPassthrough(settings);
      }

      setResponseContent({
        code: response.code,
        text: response.text,
      });
    }
    setFunctionRunning(false);
  };

  const runUsingPassthrough = async (settings: NetAjaxSettings): Promise<ResponseContent> => {
    let response: ResponseContent = { code: 0, text: '' };

    const runFunctionResponse = await FunctionsService.runFunction(settings);
    response.code = runFunctionResponse.metadata.status;
    if (runFunctionResponse.metadata.success) {
      response.text = runFunctionResponse.data as string;
    } else {
      response.text = runFunctionResponse.metadata.error;
      LogService.error(
        LogCategories.FunctionEdit,
        'runFunction',
        `Failed to runFunction: ${getErrorMessageOrStringify(runFunctionResponse.metadata.error)}`
      );
    }

    return response;
  };

  const runUsingPortal = async (settings: NetAjaxSettings): Promise<ResponseContent> => {
    let response: ResponseContent = { code: 0, text: '' };

    const runFunctionResponse = await portalContext.makeHttpRequestsViaPortal(settings);
    const runFunctionResponseResult = runFunctionResponse.result;
    const jqXHR = getJQXHR(runFunctionResponse, LogCategories.FunctionEdit, 'makeHttpRequestForRunFunction');
    if (!!jqXHR) {
      response.code = jqXHR.status;
    }

    if (isPortalCommunicationStatusSuccess(runFunctionResponse.status)) {
      response.text = runFunctionResponseResult.content;
      // This is the result of the API call
      if (response.code !== 200) {
        LogService.error(
          LogCategories.FunctionEdit,
          'makeHttpRequestForRunFunction',
          `Failed to run function: ${getErrorMessageOrStringify(runFunctionResponseResult)}`
        );
      }
    } else {
      // NOTE(krmitta): This happens when the http request on the portal fails for some reason,
      // not the api returning the error
      if (!!jqXHR) {
        response.text = jqXHR.statusText;
      }
      LogService.error(
        LogCategories.FunctionEdit,
        'makeHttpRequestForRunFunction',
        `Http request from portal failed: ${getErrorMessageOrStringify(runFunctionResponseResult)}`
      );
    }

    return response;
  };

  const getQueryString = (queries: NameValuePair[]): string => {
    const queryString = queries.map(query => `${encodeURIComponent(query.name)}=${encodeURIComponent(query.value)}`);
    return queryString.join('&');
  };

  const getFunctionUrl = (key?: string) => {
    return !!site ? `${Url.getMainUrl(site)}${createAndGetFunctionInvokeUrlPath(key)}` : '';
  };

  const setUrlsAndOptions = (keys: KeyValue<string>, keyType: UrlType) => {
    const newUrlsObj: UrlObj[] = [];
    for (const key in keys) {
      if (key in keys) {
        newUrlsObj.push({
          key: `${key} - ${keyType}`,
          text: key,
          type: keyType,
          url: getFunctionUrl(keys[key]),
          data: keys[key],
        });
      }
    }

    switch (keyType) {
      case UrlType.Host: {
        setHostUrls(newUrlsObj);
        break;
      }
      case UrlType.Function: {
        setFunctionUrls(newUrlsObj);
        break;
      }
      case UrlType.System: {
        setSystemUrls(newUrlsObj);
        break;
      }
    }
  };

  const getAndSetTestData = async () => {
    if (!!functionInfo && !!site && !!functionInfo.properties.test_data_href) {
      const testDataHrefObjects = functionInfo.properties.test_data_href.split('/vfs/');
      let testDataResponseSuccess = false;
      let testData;

      if (testDataHrefObjects.length === 2) {
        const vfsArmTestDataResponse = await FunctionsService.getTestDataOverVfsArm(site.id, testDataHrefObjects[1], runtimeVersion);
        if (vfsArmTestDataResponse.metadata.success) {
          testData = vfsArmTestDataResponse.data;
          testDataResponseSuccess = true;
        } else {
          LogService.error(
            LogCategories.FunctionEdit,
            'GetTestDataUsingVfsApi',
            `Failed to get test data from VFS API: ${getErrorMessageOrStringify(vfsArmTestDataResponse.metadata.error)}`
          );
        }
      }

      // Note (krmitta): Almost always we should be able to get the test_data through VFS Arm.
      // Adding the below fallback logic just on the off-chance that it doesn't.
      if (!testDataResponseSuccess) {
        testData = await getTestDataUsingFunctionHref(functionInfo.properties.test_data_href);
      }

      if (!!testData) {
        try {
          testData = StringUtils.stringifyJsonForEditor(testData);
        } catch (err) {
          LogService.error(LogCategories.FunctionEdit, 'invalid-test-data', err);
        }
        setTestData(testData as string);
      }
    }
  };

  const getTestDataUsingFunctionHref = async (testDataHref: string) => {
    const headers = getHeaders([], getDefaultXFunctionKey());
    const settings = {
      uri: testDataHref,
      type: 'GET',
      headers: headers,
    };

    if (enablePortalCall) {
      return await getTestDataUsingPortal(settings);
    } else {
      return await getTestDataUsingPassthrough(settings);
    }
  };

  const getTestDataUsingPortal = async (settings: NetAjaxSettings) => {
    const functionHrefTestDataResponse = await portalContext.makeHttpRequestsViaPortal(settings);
    const result = functionHrefTestDataResponse.result;

    if (isPortalCommunicationStatusSuccess(functionHrefTestDataResponse.status)) {
      return !!result && !!result.content ? result.content : result;
    } else {
      LogService.error(
        LogCategories.FunctionEdit,
        'GetTestDataUsingFunctionHref',
        `Failed to get test data: ${getErrorMessageOrStringify(result)}`
      );
    }
    return undefined;
  };

  const getTestDataUsingPassthrough = async (settings: NetAjaxSettings) => {
    const functionHrefTestDataResponse = await FunctionsService.getDataFromFunctionHref(settings.uri, settings.type as Method, {
      ...settings.headers,
      ...getAuthorizationHeaders(),
    });
    if (functionHrefTestDataResponse.metadata.success) {
      return functionHrefTestDataResponse.data;
    } else {
      LogService.error(
        LogCategories.FunctionEdit,
        'GetTestDataUsingFunctionHref',
        `Failed to get test data: ${getErrorMessageOrStringify(functionHrefTestDataResponse.metadata.error)}`
      );
    }
    return undefined;
  };

  const getAuthorizationHeaders = (): KeyValue<string> => {
    return {
      Authorization: `Bearer ${startupInfoContext.token}`,
      FunctionsPortal: '1',
    };
  };

  const refresh = async () => {
    if (!!site) {
      setIsRefreshing(true);
      SiteService.fireSyncTrigger(site, startupInfoContext.token).then(r => {
        fetchData();
        if (!r.metadata.success) {
          LogService.error(
            LogCategories.FunctionEdit,
            'fireSyncTrigger',
            `Failed to fire syncTrigger: ${getErrorMessageOrStringify(r.metadata.error)}`
          );
        }
      });
    }
  };

  const getDefaultXFunctionKey = (): string => {
    return hostKeys && hostKeys.masterKey ? `master - Host` : '';
  };

  const getXFunctionKeyValue = (xFunctionKey: string): string => {
    for (const url in functionUrls) {
      if (url in functionUrls && functionUrls[url].key === xFunctionKey) {
        return functionUrls[url].data as string;
      }
    }
    for (const url in hostUrls) {
      if (url in hostUrls && hostUrls[url].key === xFunctionKey) {
        return hostUrls[url].data as string;
      }
    }
    return '';
  };

  const isOverlayLoadingComponentVisible = () => {
    return isUploadingFile || isRefreshing;
  };

  const refreshFileList = async () => {
    if (site && functionInfo && runtimeVersion) {
      const fileListResponse = await FunctionsService.getFileContent(site.id, functionInfo.properties.name, runtimeVersion);
      if (fileListResponse && fileListResponse.metadata.success) {
        setFileList(fileListResponse.data as VfsObject[]);
      } else {
        LogService.error(
          LogCategories.FunctionEdit,
          'getFileContent',
          `Failed to get file content: ${getErrorMessageOrStringify(fileListResponse.metadata.error)}`
        );
      }
    }
  };

  const getAndUpdateSiteConfig = async () => {
    const siteConfigResponse = await SiteService.fetchWebConfig(getSiteResourceId());
    if (siteConfigResponse.metadata.success) {
      functionEditorData.functionData = {
        siteConfig: siteConfigResponse.data,
      };
    } else {
      LogService.error(
        LogCategories.FunctionEdit,
        'fetchSiteConfig',
        `Failed to fetch site-config: ${getErrorMessageOrStringify(siteConfigResponse.metadata.error)}`
      );
    }
  };

  const addCorsRule = async (corsRule: string) => {
    setIsRefreshing(true);
    const siteConfig = functionEditorData.functionData.siteConfig;
    const allowedOrigins = !!siteConfig && siteConfig.properties.cors.allowedOrigins ? siteConfig.properties.cors.allowedOrigins : [];
    allowedOrigins.push(corsRule);
    const body = {
      properties: {
        cors: {
          allowedOrigins: allowedOrigins,
        },
      },
    };

    const updateSiteConfigResponse = await SiteService.patchSiteConfig(getSiteResourceId(), body);

    if (updateSiteConfigResponse.metadata.success) {
      await getAndUpdateSiteConfig();
    } else {
      LogService.error(
        LogCategories.FunctionEdit,
        'patchSiteConfig',
        `Failed to get update site-config: ${getErrorMessageOrStringify(updateSiteConfigResponse.metadata.error)}`
      );
    }

    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!!site && !!functionInfo) {
      if (!!hostKeys) {
        setUrlsAndOptions({ master: hostKeys.masterKey, ...hostKeys.functionKeys }, UrlType.Host);
        setUrlsAndOptions({ ...hostKeys.systemKeys }, UrlType.System);
      }
      if (!!functionKeys) {
        setUrlsAndOptions(functionKeys, UrlType.Function);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site, functionInfo, hostKeys, functionKeys]);

  useEffect(() => {
    getAndSetTestData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [functionInfo, hostKeys]);
  // TODO (krmitta): Show a loading error message site or functionInfo call fails
  if (initialLoading || !site) {
    return <LoadingComponent />;
  }
  return (
    <FunctionEditorContext.Provider value={functionEditorData}>
      {!!functionInfo ? (
        <div style={showTestPanel ? shrinkEditorStyle(window.innerWidth) : undefined}>
          <FunctionEditor
            functionInfo={functionInfo}
            site={site}
            run={run}
            fileList={fileList}
            runtimeVersion={runtimeVersion}
            responseContent={responseContent}
            functionRunning={functionRunning}
            urlObjs={[...functionUrls, ...hostUrls, ...systemUrls]}
            showTestPanel={showTestPanel}
            setShowTestPanel={setShowTestPanel}
            testData={testData}
            refresh={refresh}
            isRefreshing={isRefreshing}
            xFunctionKey={getDefaultXFunctionKey()}
            getFunctionUrl={getFunctionUrl}
            isUploadingFile={isUploadingFile}
            setIsUploadingFile={setIsUploadingFile}
            refreshFileList={refreshFileList}
            workerRuntime={workerRuntime}
            addCorsRule={addCorsRule}
            enablePortalCall={enablePortalCall}
            isLinuxSkuFlightingEnabled={isLinuxSkuFlightingEnabled}
          />
        </div>
      ) : (
        <CustomBanner message={t('functionInfoFetchError')} type={MessageBarType.error} />
      )}
      {isOverlayLoadingComponentVisible() && <LoadingComponent overlay={true} />}
    </FunctionEditorContext.Provider>
  );
};

export default FunctionEditorDataLoader;
