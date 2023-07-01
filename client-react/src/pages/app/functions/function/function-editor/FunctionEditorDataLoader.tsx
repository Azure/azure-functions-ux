import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MessageBarType } from '@fluentui/react';

import FunctionsService, {
  GetTestDataFromFunctionHrefOptions,
  RunFunctionControllerOptions,
} from '../../../../../ApiHelpers/FunctionsService';
import { getJsonHeaders } from '../../../../../ApiHelpers/HttpClient';
import SiteService from '../../../../../ApiHelpers/SiteService';
import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import { NetAjaxSettings } from '../../../../../models/ajax-request-model';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { RuntimeExtensionCustomVersions, RuntimeExtensionMajorVersions } from '../../../../../models/functions/runtime-extension';
import { VfsObject } from '../../../../../models/functions/vfs';
import { KeyValue } from '../../../../../models/portal-models';
import { PortalContext } from '../../../../../PortalContext';
import { SiteStateContext } from '../../../../../SiteState';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import { BindingManager } from '../../../../../utils/BindingManager';
import { Guid } from '../../../../../utils/Guid';
import { LogCategories } from '../../../../../utils/LogCategories';
import { getJQXHR, isPortalCommunicationStatusSuccess } from '../../../../../utils/portal-utils';
import { ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
import SiteHelper from '../../../../../utils/SiteHelper';
import StringUtils from '../../../../../utils/string';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import Url from '../../../../../utils/url';

import { FunctionEditor } from './FunctionEditor';
import FunctionEditorData from './FunctionEditor.data';
import { shrinkEditorStyle } from './FunctionEditor.styles';
import { NameValuePair, ResponseContent, UrlObj, urlParameterRegExp, UrlType } from './FunctionEditor.types';
import { isNewNodeProgrammingModel, isNewPythonProgrammingModel, useFunctionEditorQueries } from './useFunctionEditorQueries';

interface FunctionEditorDataLoaderProps {
  resourceId: string;
}

const functionEditorData = new FunctionEditorData();

export const FunctionEditorContext = createContext(functionEditorData);

const FunctionEditorDataLoader: React.FC<FunctionEditorDataLoaderProps> = ({ resourceId }: FunctionEditorDataLoaderProps) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [responseContent, setResponseContent] = useState<ResponseContent | undefined>(undefined);
  const [functionRunning, setFunctionRunning] = useState(false);
  const [hostUrls, setHostUrls] = useState<UrlObj[]>([]);
  const [systemUrls, setSystemUrls] = useState<UrlObj[]>([]);
  const [functionUrls, setFunctionUrls] = useState<UrlObj[]>([]);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testData, setTestData] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addingCorsRules, setAddingCorsRules] = useState(false);
  const [retryFunctionTest, setRetryFunctionTest] = useState(true);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const siteStateContext = useContext(SiteStateContext);
  const startupInfoContext = useContext(StartupInfoContext);
  const portalContext = useContext(PortalContext);

  const { t } = useTranslation();

  const {
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
    status,
    workerRuntime,
  } = useFunctionEditorQueries(resourceId, functionEditorData);

  const isHttpOrWebHookFunction = !!functionInfo && functionEditorData.isHttpOrWebHookFunction(functionInfo);

  const getSiteResourceId = () => {
    const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
    return armSiteDescriptor.getTrimmedResourceId();
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
        const functionKey = key || functionKeys?.default;

        code = functionKey ?? '';

        if (!!webHookTypeInfoInfo && functionKey) {
          if (hostKeys) {
            const allKeys = { ...hostKeys.functionKeys, ...hostKeys.systemKeys };
            const keyWithValue = Object.keys(allKeys).find(k => allKeys[k] === functionKey);
            clientId = keyWithValue ?? '';
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
      portalContext.log(
        getTelemetryInfo('error', 'getFunctionInvokeUrl', 'failed', {
          error: site,
          message: 'No function info found for the site',
        })
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
      headers['x-functions-key'] = xFunctionKey ? getXFunctionKeyValue(xFunctionKey) : hostKeys.masterKey;
    }
    return headers;
  };

  // Used to get settings for both http and webHook functions
  const getSettingsToInvokeHttpFunction = (
    newFunctionInfo: ArmObj<FunctionInfo>,
    xFunctionKey?: string,
    liveLogsSessionId?: string
  ): NetAjaxSettings | undefined => {
    if (site) {
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
      if (queryString) {
        url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
      }

      const headers = getHeaders(testDataObject.headers, xFunctionKey);

      let body: unknown = testDataObject.body;
      if (!body && isNewNodeProgrammingModel(newFunctionInfo)) {
        body = undefined;
      }

      return {
        uri: url,
        type: testDataObject.method as string,
        headers: { ...headers, ...getHeadersForLiveLogsSessionId(liveLogsSessionId) },
        data: body,
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
    if (site) {
      const baseUrl = Url.getMainUrl(site);
      const input = newFunctionInfo.properties.test_data || '';

      let data: unknown = { input };
      let url = `${baseUrl}/admin/functions/${newFunctionInfo.properties.name.toLowerCase()}`;
      if (functionEditorData.isAuthenticationEventsTriggerFunction(newFunctionInfo)) {
        try {
          data = JSON.parse(input);
        } catch {
          /** @note (joechung): Treat invalid JSON as string input. */
        }

        const functionKey = xFunctionKey ?? functionKeys?.default;
        const code = [...functionUrls, ...hostUrls, ...systemUrls].find(urlObj => urlObj.key === functionKey)?.data;
        url = functionEditorData.getAuthenticationTriggerUrl(baseUrl, newFunctionInfo, code);
      }

      const headers = getHeaders([], xFunctionKey);

      return {
        uri: url,
        type: 'POST',
        headers: { ...headers, ...getHeadersForLiveLogsSessionId(liveLogsSessionId) },
        data,
      };
    }
    return undefined;
  };

  const getHeadersForLiveLogsSessionId = (liveLogsSessionId?: string) => {
    return { '#AzFuncLiveLogsSessionId': liveLogsSessionId || '' };
  };

  const run = async (newFunctionInfo: ArmObj<FunctionInfo>, xFunctionKey?: string, liveLogsSessionId?: string) => {
    setFunctionRunning(true);

    // Do not update v2 Python functions here since its metadata is derived from code, not from function.json.
    if (!SiteHelper.isFunctionAppReadOnly(siteStateContext.siteAppEditState) && !isNewPythonProgrammingModel(functionInfo)) {
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

    if (settings) {
      let response: ResponseContent = { code: 0, text: '' };

      let runFromPassthrough = true;
      if (enablePortalCall) {
        response = await runUsingPortal(settings);
        runFromPassthrough = response.code < 100 || response.code >= 400;
      }

      if (runFromPassthrough) {
        let parsedTestData: { headers: NameValuePair[] };
        try {
          parsedTestData = JSON.parse(newFunctionInfo.properties.test_data);
        } catch {
          parsedTestData = { headers: [] };
        }

        const path = site ? settings.uri.substring(Url.getMainUrl(site).length) : '';
        const inputHeaders: NameValuePair[] = [];
        if (parsedTestData.headers) {
          for (const parameter of parsedTestData.headers) {
            inputHeaders.push({ name: parameter.name, value: parameter.value });
          }
        }
        const functionKey = hostKeys?.masterKey ? (xFunctionKey ? getXFunctionKeyValue(xFunctionKey) : hostKeys.masterKey) : '';
        const options: RunFunctionControllerOptions = {
          resourceId: site?.id ?? '',
          path: path,
          body: settings.data,
          inputMethod: settings.type,
          inputHeaders: isHttpOrWebHookFunction ? inputHeaders : [],
          authToken: getAuthorizationHeaders()['Authorization'],
          clientRequestId: Guid.newGuid(),
          functionKey: functionKey,
          liveLogsSessionId: liveLogsSessionId || '',
        };
        response = await runUsingPassthrough(settings, options);
      }

      setResponseContent({
        code: response.code,
        text: response.text,
      });
    }
    setFunctionRunning(false);
  };

  const runUsingPassthrough = async (
    settings: NetAjaxSettings,
    runFunctionsControllerOptions: RunFunctionControllerOptions
  ): Promise<ResponseContent> => {
    const response: ResponseContent = { code: 0, text: '' };

    const runFunctionResponse = await FunctionsService.runFunction(settings, runFunctionsControllerOptions);
    response.code = runFunctionResponse.metadata.status;
    if (runFunctionResponse.metadata.success) {
      response.text = runFunctionResponse.data as string;
    } else {
      response.text = runFunctionResponse.metadata.error;
      portalContext.log(
        getTelemetryInfo('error', 'runFunction', 'failed', {
          error: runFunctionResponse.metadata.error,
          message: 'Failed to run-function',
        })
      );
    }

    return response;
  };

  const runUsingPortal = async (settings: NetAjaxSettings): Promise<ResponseContent> => {
    const response: ResponseContent = { code: 0, text: '' };

    let runFunctionResponse;
    if (retryFunctionTest) {
      let errorCount = 0;
      let functionSuccess = false;
      for (errorCount = 0; errorCount < 5 && !functionSuccess; ++errorCount) {
        runFunctionResponse = await portalContext.makeHttpRequestsViaPortal(settings, /* setContentType */ true);
        const jqXHR = getJQXHR(runFunctionResponse, LogCategories.FunctionEdit, 'makeHttpRequestForRunFunction');
        if (jqXHR && jqXHR.status && jqXHR.status !== 200) {
          functionSuccess = true;
        }
      }
      setRetryFunctionTest(false);
    } else {
      runFunctionResponse = await portalContext.makeHttpRequestsViaPortal(settings, /* setContentType */ true);
    }

    const runFunctionResponseResult = runFunctionResponse.result;
    const jqXHR = getJQXHR(runFunctionResponse, LogCategories.FunctionEdit, 'makeHttpRequestForRunFunction');
    if (jqXHR) {
      response.code = jqXHR.status;
    }

    if (isPortalCommunicationStatusSuccess(runFunctionResponse.status)) {
      response.text = runFunctionResponseResult.content;
      // This is the result of the API call
      if (response.code !== 200) {
        portalContext.log(
          getTelemetryInfo('error', 'makeHttpRequestForRunFunction', 'failed', {
            error: runFunctionResponseResult,
            message: 'Failed to run functions',
          })
        );
      }
    } else {
      // NOTE(krmitta): This happens when the http request on the portal fails for some reason,
      // not the api returning the error
      if (jqXHR) {
        response.text = jqXHR.statusText;
      }
      portalContext.log(
        getTelemetryInfo('error', 'makeHttpRequestForRunFunction', 'failed', {
          error: runFunctionResponseResult,
          message: 'Http request from portal failed',
        })
      );
    }

    return response;
  };

  const getQueryString = (queries: NameValuePair[]): string => {
    const queryString = queries.map(query => `${encodeURIComponent(query.name)}=${encodeURIComponent(query.value)}`);
    return queryString.join('&');
  };

  const getFunctionUrl = (key?: string) => {
    return site ? `${Url.getMainUrl(site)}${createAndGetFunctionInvokeUrlPath(key)}` : '';
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
        const vfsArmTestDataResponse = await FunctionsService.getTestDataOverVfsArm(site.id, testDataHrefObjects[1]);
        if (vfsArmTestDataResponse.metadata.success) {
          testData = vfsArmTestDataResponse.data;
          testDataResponseSuccess = true;
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'getTestDataUsingVfsApi', 'failed', {
              error: vfsArmTestDataResponse.metadata.error,
              message: 'Failed to get test data from VFS API',
            })
          );
        }
      }

      // Note (krmitta): Almost always we should be able to get the test_data through VFS Arm.
      // Adding the below fallback logic just on the off-chance that it doesn't.
      if (!testDataResponseSuccess) {
        testData = await getTestDataUsingFunctionHref(functionInfo.properties.test_data_href);
      }

      if (testData) {
        try {
          testData = StringUtils.stringifyJsonForEditor(testData);
        } catch (err) {
          portalContext.log(
            getTelemetryInfo('error', 'invalid-test-data', 'failed', {
              error: err,
            })
          );
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
      const defaultFunctionKey = getDefaultXFunctionKey();
      const functionKey = hostKeys?.masterKey ? (defaultFunctionKey ? getXFunctionKeyValue(defaultFunctionKey) : hostKeys.masterKey) : '';
      const getTestDataUsingFunctionHrefOptions: GetTestDataFromFunctionHrefOptions = {
        resourceId: functionInfo?.id ?? '',
        functionKey: functionKey,
        clientRequestId: Guid.newGuid(),
        authToken: getAuthorizationHeaders()['Authorization'],
      };
      return await getTestDataUsingPassthrough(settings, getTestDataUsingFunctionHrefOptions);
    }
  };

  const getTestDataUsingPortal = async (settings: NetAjaxSettings) => {
    const functionHrefTestDataResponse = await portalContext.makeHttpRequestsViaPortal(settings);
    const result = functionHrefTestDataResponse.result;

    if (isPortalCommunicationStatusSuccess(functionHrefTestDataResponse.status)) {
      const jqXHR = getJQXHR(result, LogCategories.FunctionEdit, 'makeHttpRequestForTestData');
      return jqXHR?.responseText;
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'getTestDataUsingFunctionHref', 'failed', {
          error: result,
          message: 'Failed to get test data',
        })
      );
    }
    return undefined;
  };

  const getTestDataUsingPassthrough = async (
    settings: NetAjaxSettings,
    getTestDataUsingFunctionHrefOptions: GetTestDataFromFunctionHrefOptions
  ) => {
    const getDataFromFunctionHrefSettings: NetAjaxSettings = {
      ...settings,
      headers: {
        ...settings.headers,
        ...getAuthorizationHeaders(),
      },
    };
    const functionHrefTestDataResponse = await FunctionsService.getDataFromFunctionHref(
      getDataFromFunctionHrefSettings,
      getTestDataUsingFunctionHrefOptions
    );
    if (functionHrefTestDataResponse.metadata.success) {
      return functionHrefTestDataResponse.data;
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'getTestDataUsingFunctionHref', 'failed', {
          error: functionHrefTestDataResponse.metadata.error,
          message: 'Failed to get test data',
        })
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

  const refresh = useCallback(() => {
    if (site) {
      setIsRefreshing(true);

      SiteService.fireSyncTrigger(site).then(response => {
        refreshQueries();

        if (!response.metadata.success) {
          portalContext.log(
            getTelemetryInfo('error', 'fireSyncTrigger', 'failed', {
              error: response.metadata.error,
              message: 'Failed to fire syncTrigger',
            })
          );
        }
      });
    }
  }, [portalContext, refreshQueries, site]);

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
        portalContext.log(
          getTelemetryInfo('error', 'getFileContent', 'failed', {
            error: fileListResponse.metadata.error,
            message: 'Failed to get file content',
          })
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
      portalContext.log(
        getTelemetryInfo('error', 'fetchSiteConfig', 'failed', {
          error: siteConfigResponse.metadata.error,
          message: 'Failed to fetch site config',
        })
      );
    }
  };

  const addCorsRule = async (corsRule: string) => {
    setAddingCorsRules(true);
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
      portalContext.log(
        getTelemetryInfo('error', 'patchSiteConfig', 'failed', {
          error: updateSiteConfigResponse.metadata.error,
          message: 'Failed to update site-config',
        })
      );
    }

    //(NOTE) stpelleg: Need to add a delay of 30s for Function App restart
    //Function App does not show as restarting, only returns "Running"
    const functionAppRestartPromise = new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 60000);
    });

    functionAppRestartPromise.then(() => {
      setAddingCorsRules(false);
      setIsRefreshing(false);
      setRetryFunctionTest(true);
      refresh();
    });
  };

  useEffect(() => {
    refreshQueries();
  }, [refreshQueries]);

  useEffect(() => {
    if (initialLoading && (status === 'error' || status === 'success' || status === 'unauthorized')) {
      setInitialLoading(false);
    }
  }, [initialLoading, status]);

  useEffect(() => {
    if (isRefreshing && (status === 'error' || status === 'success' || status === 'unauthorized')) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, status]);

  useEffect(() => {
    if (!!site && !!functionInfo) {
      if (hostKeys) {
        setUrlsAndOptions({ master: hostKeys.masterKey, ...hostKeys.functionKeys }, UrlType.Host);
        setUrlsAndOptions({ ...hostKeys.systemKeys }, UrlType.System);
      }
      if (functionKeys) {
        setUrlsAndOptions(functionKeys, UrlType.Function);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site, functionInfo, hostKeys, functionKeys]);

  const onCustomBannerClick = useCallback(() => {
    portalContext.openBlade({
      detailBlade: 'FunctionDownloadContentTemplateBlade',
      detailBladeInputs: {
        id: site?.id,
      },
      extension: 'WebsitesExtension',
      openAsContextBlade: true,
    });
  }, [portalContext, site?.id]);

  // TODO (krmitta): Show a loading error message site or functionInfo call fails
  if (initialLoading || !site) {
    return <LoadingComponent />;
  }

  return (
    <FunctionEditorContext.Provider value={functionEditorData}>
      {functionInfo ? (
        <div style={showTestPanel ? shrinkEditorStyle(window.innerWidth) : undefined}>
          <FunctionEditor
            getAndSetTestData={getAndSetTestData}
            hostKeys={hostKeys}
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
            addingCorsRules={addingCorsRules}
            status={status}
          />
        </div>
      ) : site?.id ? (
        <CustomBanner message={t('functionInfoUnavailableError')} type={MessageBarType.error} onClick={onCustomBannerClick} />
      ) : (
        <CustomBanner message={t('functionInfoFetchError')} type={MessageBarType.error} />
      )}

      {isOverlayLoadingComponentVisible() && <LoadingComponent overlay={true} />}
    </FunctionEditorContext.Provider>
  );
};

export default FunctionEditorDataLoader;
