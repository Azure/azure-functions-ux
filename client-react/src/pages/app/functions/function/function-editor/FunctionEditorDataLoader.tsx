import { MessageBarType } from '@fluentui/react';
import { Method } from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
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
import { LogCategories } from '../../../../../utils/LogCategories';
import LogService from '../../../../../utils/LogService';
import { getJQXHR, isPortalCommunicationStatusSuccess } from '../../../../../utils/portal-utils';
import { ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
import SiteHelper from '../../../../../utils/SiteHelper';
import StringUtils from '../../../../../utils/string';
import Url from '../../../../../utils/url';
import { FunctionEditor } from './FunctionEditor';
import FunctionEditorData from './FunctionEditor.data';
import { shrinkEditorStyle } from './FunctionEditor.styles';
import { NameValuePair, ResponseContent, UrlObj, urlParameterRegExp, UrlType } from './FunctionEditor.types';
import { useFunctionEditorQueries } from './useFunctionEditorQueries';

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
    isFunctionLogsApiFlightingEnabled,
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
    if (site) {
      const baseUrl = Url.getMainUrl(site);
      const input = newFunctionInfo.properties.test_data || '';

      let data: unknown = { input };
      let url = `${baseUrl}/admin/functions/${newFunctionInfo.properties.name.toLowerCase()}`;
      if (functionEditorData.isAuthenticationEventTriggerFunction(newFunctionInfo)) {
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

    if (settings) {
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
    const response: ResponseContent = { code: 0, text: '' };

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
    const response: ResponseContent = { code: 0, text: '' };

    let runFunctionResponse;
    if (retryFunctionTest) {
      let errorCount = 0;
      let functionSuccess = false;
      for (errorCount = 0; errorCount < 5 && !functionSuccess; ++errorCount) {
        runFunctionResponse = await portalContext.makeHttpRequestsViaPortal(settings);
        const jqXHR = getJQXHR(runFunctionResponse, LogCategories.FunctionEdit, 'makeHttpRequestForRunFunction');
        if (jqXHR && jqXHR.status && jqXHR.status !== 200) {
          functionSuccess = true;
        }
      }
      setRetryFunctionTest(false);
    } else {
      runFunctionResponse = await portalContext.makeHttpRequestsViaPortal(settings);
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
        LogService.error(
          LogCategories.FunctionEdit,
          'makeHttpRequestForRunFunction',
          `Failed to run function: ${getErrorMessageOrStringify(runFunctionResponseResult)}`
        );
      }
    } else {
      // NOTE(krmitta): This happens when the http request on the portal fails for some reason,
      // not the api returning the error
      if (jqXHR) {
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

      if (testData) {
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

  const refresh = useCallback(() => {
    if (site) {
      setIsRefreshing(true);

      SiteService.fireSyncTrigger(site).then(response => {
        refreshQueries();

        if (!response.metadata.success) {
          LogService.error(
            LogCategories.FunctionEdit,
            'fireSyncTrigger',
            `Failed to fire syncTrigger: ${getErrorMessageOrStringify(response.metadata.error)}`
          );
        }
      });
    }
  }, [refreshQueries, site]);

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
      LogService.error(
        LogCategories.FunctionEdit,
        'patchSiteConfig',
        `Failed to get update site-config: ${getErrorMessageOrStringify(updateSiteConfigResponse.metadata.error)}`
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
    if (initialLoading && (status === 'error' || status === 'success')) {
      setInitialLoading(false);
    }
  }, [initialLoading, status]);

  useEffect(() => {
    if (isRefreshing && (status === 'error' || status === 'success')) {
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
      {functionInfo ? (
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
            isFunctionLogsApiFlightingEnabled={isFunctionLogsApiFlightingEnabled}
            addingCorsRules={addingCorsRules}
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
