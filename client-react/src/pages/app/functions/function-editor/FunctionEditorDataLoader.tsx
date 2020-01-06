import React, { useState, useEffect, useContext } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import LoadingComponent from '../../../../components/loading/loading-component';
import { FunctionEditor } from './FunctionEditor';
import { ArmSiteDescriptor } from '../../../../utils/resourceDescriptors';
import FunctionEditorData from './FunctionEditor.data';
import { Site } from '../../../../models/site/site';
import { SiteRouterContext } from '../../SiteRouter';
import Url from '../../../../utils/url';
import { NameValuePair } from './FunctionEditor.types';
import AppKeyService from '../../../../ApiHelpers/AppKeysService';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { BindingManager } from '../../../../utils/BindingManager';
import { AppKeysInfo } from '../app-keys/AppKeys.types';
import SiteService from '../../../../ApiHelpers/SiteService';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';
import { Host } from '../../../../models/functions/host';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { VfsObject } from '../../../../models/functions/vfs';

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
  const [functionKeys, setFunctionKeys] = useState<{ [key: string]: string }>({});
  const [runtimeVersion, setRuntimeVersion] = useState<string | undefined>(undefined);
  const [hostJsonContent, setHostJsonContent] = useState<Host | undefined>(undefined);
  const [fileList, setFileList] = useState<VfsObject[] | undefined>(undefined);

  const siteContext = useContext(SiteRouterContext);

  const fetchData = async () => {
    const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
    const siteResourceId = armSiteDescriptor.getSiteOnlyResourceId();
    const [siteResponse, functionInfoResponse, appSettingsResponse, appKeysResponse, functionKeysResponse] = await Promise.all([
      siteContext.fetchSite(siteResourceId),
      functionEditorData.getFunctionInfo(resourceId),
      SiteService.fetchApplicationSettings(siteResourceId),
      AppKeyService.fetchKeys(siteResourceId),
      FunctionsService.fetchKeys(resourceId),
    ]);

    if (siteResponse.metadata.success) {
      setSite(siteResponse.data);
    }
    if (functionInfoResponse.metadata.success) {
      setFunctionInfo(functionInfoResponse.data);
    }
    if (appSettingsResponse.metadata.success) {
      const currentRuntimeVersion = appSettingsResponse.data.properties[CommonConstants.AppSettingNames.functionsExtensionVersion];
      setRuntimeVersion(currentRuntimeVersion);
      const [hostJsonResponse, fileListResponse] = await Promise.all([
        FunctionsService.getHostJson(siteResourceId, functionInfoResponse.data.properties.name, currentRuntimeVersion),
        FunctionsService.getFileContent(siteResourceId, functionInfoResponse.data.properties.name, currentRuntimeVersion),
      ]);
      if (hostJsonResponse.metadata.success) {
        setHostJsonContent(hostJsonResponse.data);
      }

      if (fileListResponse.metadata.success) {
        setFileList(fileListResponse.data as VfsObject[]);
      }
    }
    if (appKeysResponse.metadata.success) {
      setHostKeys(appKeysResponse.data);
    }
    if (functionKeysResponse.metadata.success) {
      setFunctionKeys(functionKeysResponse.data);
    }
    setInitialLoading(false);
  };

  const createAndGetFunctionInvokeUrl = (key?: string) => {
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

        if (authLevelInfo && authLevelInfo.authLevel.toLowerCase() !== 'anonymous') {
          code = '';
        }

        if (code) {
          queryParams.push(`code=${code}`);
        }

        if (clientId) {
          queryParams.push(`clientId=${clientId}`);
        }
        return getFunctionInvokeUrl(result, queryParams);
      }
    }
    LogService.error(
      LogCategories.functionInvokeUrl,
      'GetFunctionInvokeUrl',
      `No function Info found for the site: ${JSON.stringify(site)}`
    );
    return '';
  };

  const getResultFromHostJson = (): string => {
    let result = '';
    switch (runtimeVersion) {
      case RuntimeExtensionMajorVersions.beta:
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

  const getFunctionInvokeUrl = (result: string, queryParams: string[]) => {
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
      return `${getMainUrl(functionInfo.properties.name)}${path}`;
    }
    return '';
  };

  const getMainUrl = (functionName: string) => {
    if (!site) {
      return '';
    }
    return `${Url.getMainUrl(site)}/admin/functions/${functionName.toLowerCase()}`;
  };

  const run = async (newFunctionInfo: ArmObj<FunctionInfo>) => {
    const updatedFunctionInfo = await functionEditorData.updateFunctionInfo(resourceId, newFunctionInfo);
    if (updatedFunctionInfo.metadata.success) {
      const data = updatedFunctionInfo.data;
      const functionInvokeUrl = createAndGetFunctionInvokeUrl();
      let url = !!functionInvokeUrl ? functionInvokeUrl : getMainUrl(data.properties.name);
      if (!!url) {
        let parsedTestData = {};
        try {
          parsedTestData = JSON.parse(data.properties.test_data);
        } catch (err) {}
        const testDataObject = functionEditorData.getProcessedFunctionTestData(parsedTestData);
        const queryString = getQueryString(testDataObject.queries);
        if (!!queryString) {
          url += '?';
        }
        url += queryString;
        // TODO (krmitta): Make the API call (using URL created above) to run function and pass the response to FunctionTest Component [WI: 5536379]
      }
    }
  };

  const getQueryString = (queries: NameValuePair[]): string => {
    const queryString = queries.map(query => `${query.name}=${query.value}`);
    return queryString.join('&');
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO (krmitta): Show a loading error message site or functionInfo call fails
  if (initialLoading || !site || !functionInfo) {
    return <LoadingComponent />;
  }
  return (
    <FunctionEditorContext.Provider value={functionEditorData}>
      <FunctionEditor functionInfo={functionInfo} site={site} run={run} fileList={fileList} />
    </FunctionEditorContext.Provider>
  );
};

export default FunctionEditorDataLoader;
