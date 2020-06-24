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
import { Method } from 'axios';
import { getJsonHeaders } from '../../../../../ApiHelpers/HttpClient';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import { shrinkEditorStyle } from './FunctionEditor.styles';
import { ValidationRegex } from '../../../../../utils/constants/ValidationRegex';
import { KeyValue } from '../../../../../models/portal-models';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';
import { HttpResponseObject } from '../../../../../ArmHelper.types';
import StringUtils from '../../../../../utils/string';

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

  const siteContext = useContext(SiteRouterContext);
  const startupInfoContext = useContext(StartupInfoContext);

  const isHttpOrWebHookFunction = !!functionInfo && functionEditorData.isHttpOrWebHookFunction(functionInfo);

  const fetchData = async () => {
    const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
    const siteResourceId = armSiteDescriptor.getTrimmedResourceId();
    const [siteResponse, functionInfoResponse, appKeysResponse, functionKeysResponse, hostStatusResponse] = await Promise.all([
      siteContext.fetchSite(siteResourceId),
      functionEditorData.getFunctionInfo(resourceId),
      AppKeyService.fetchKeys(siteResourceId),
      FunctionsService.fetchKeys(resourceId),
      SiteService.fetchFunctionsHostStatus(siteResourceId),
    ]);

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
      const currentRuntimeVersion = getRuntimeVersionString(hostStatusData.properties.version);
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
      case RuntimeExtensionCustomVersions.beta:
      case RuntimeExtensionMajorVersions.v2:
      case RuntimeExtensionMajorVersions.v3: {
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
      case RuntimeExtensionMajorVersions.v1:
      default: {
        result =
          hostJsonContent &&
          hostJsonContent.http &&
          hostJsonContent.http.routePrefix !== undefined &&
          hostJsonContent.http.routePrefix !== null
            ? hostJsonContent.http.routePrefix
            : 'api';
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

  // Used to run both http and webHook functions
  const runHttpFunction = async (newFunctionInfo: ArmObj<FunctionInfo>, xFunctionKey?: string) => {
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

      return FunctionsService.runFunction(url, testDataObject.method as Method, headers, testDataObject.body);
    }
    return undefined;
  };

  // Used to run non-http and non-webHook functions
  const runNonHttpFunction = async (newFunctionInfo: ArmObj<FunctionInfo>, xFunctionKey?: string) => {
    if (!!site) {
      const url = `${Url.getMainUrl(site)}/admin/functions/${newFunctionInfo.properties.name.toLowerCase()}`;
      const headers = getHeaders([], xFunctionKey);
      return FunctionsService.runFunction(url, 'POST', headers, { input: newFunctionInfo.properties.test_data || '' });
    }
    return undefined;
  };

  const run = async (newFunctionInfo: ArmObj<FunctionInfo>, xFunctionKey?: string) => {
    setFunctionRunning(true);
    const updatedFunctionInfo = await functionEditorData.updateFunctionInfo(resourceId, newFunctionInfo);
    if (updatedFunctionInfo.metadata.success) {
      setFunctionInfo(updatedFunctionInfo.data);
    }

    let runResponse: HttpResponseObject<any> | undefined;
    if (isHttpOrWebHookFunction) {
      runResponse = await runHttpFunction(newFunctionInfo, xFunctionKey);
    } else {
      runResponse = await runNonHttpFunction(newFunctionInfo, xFunctionKey);
    }

    if (!!runResponse) {
      let resData = '';
      if (runResponse.metadata.success) {
        resData = runResponse.data;
      } else {
        resData = runResponse.metadata.error;
      }

      setResponseContent({
        code: runResponse.metadata.status,
        text: resData,
      });
    }
    setFunctionRunning(false);
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

  const getAuthorizationHeaders = (): KeyValue<string> => {
    return {
      Authorization: `Bearer ${startupInfoContext.token}`,
      FunctionsPortal: '1',
    };
  };

  const getAndSetTestData = async () => {
    if (!!functionInfo && !!hostKeys && !!functionInfo.properties.test_data_href) {
      const headers = getAuthorizationHeaders();
      const testDataResponse = await FunctionsService.getDataFromFunctionHref(functionInfo.properties.test_data_href, 'GET', headers);
      if (testDataResponse.metadata.success) {
        let data = testDataResponse.data;
        try {
          data = StringUtils.stringifyJsonForEditor(testDataResponse.data);
        } catch (err) {
          LogService.error(LogCategories.FunctionEdit, 'invalid-test-data', err);
        }
        setTestData(data as string);
      }
    }
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
  if (initialLoading || !site || !functionInfo) {
    return <LoadingComponent />;
  }
  return (
    <FunctionEditorContext.Provider value={functionEditorData}>
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
        />
      </div>
      {isRefreshing && <LoadingComponent overlay={true} />}
    </FunctionEditorContext.Provider>
  );
};

export default FunctionEditorDataLoader;
