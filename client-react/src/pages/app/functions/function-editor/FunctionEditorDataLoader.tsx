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
import { KeyValuePair } from './FunctionEditor.types';
import AppKeyService from '../../../../ApiHelpers/AppKeysService';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { BindingManager } from '../../../../utils/BindingManager';
import { AppKeysInfo } from '../app-keys/AppKeys.types';
import SiteService from '../../../../ApiHelpers/SiteService';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';
import { Host } from '../../../../models/functions/host';

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

  const siteContext = useContext(SiteRouterContext);

  const fetchData = async () => {
    const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
    const siteResourceId = armSiteDescriptor.getSiteOnlyResourceId();
    const [siteRes, functionInfoRes, appSettingsRes, appKeysRes, functionKeysRes] = await Promise.all([
      siteContext.fetchSite(siteResourceId),
      functionEditorData.getFunctionInfo(resourceId),
      SiteService.fetchApplicationSettings(siteResourceId),
      AppKeyService.fetchKeys(siteResourceId),
      FunctionsService.fetchKeys(resourceId),
    ]);

    if (siteRes.metadata.success) {
      setSite(siteRes.data);
    }
    if (functionInfoRes.metadata.success) {
      setFunctionInfo(functionInfoRes.data);
    }
    if (appSettingsRes.metadata.success) {
      const currentRuntimeVersion = appSettingsRes.data.properties[CommonConstants.AppSettingNames.functionsExtensionVersion];
      setRuntimeVersion(currentRuntimeVersion);
      const hostJsonRes = await FunctionsService.getHostJson(siteResourceId, functionInfoRes.data.properties.name, currentRuntimeVersion);
      if (hostJsonRes.metadata.success) {
        setHostJsonContent(hostJsonRes.data);
      }
    }
    if (appKeysRes.metadata.success) {
      setHostKeys(appKeysRes.data);
    }
    if (functionKeysRes.metadata.success) {
      setFunctionKeys(functionKeysRes.data);
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
        let queryParams = '';
        let result = '';
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
          queryParams = `?code=${code}`;
        }

        if (clientId) {
          queryParams = queryParams ? `${queryParams}&clientId=${clientId}` : `?clientId=${clientId}`;
        }
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
        return getFunctionInvokeUrl(result, queryParams);
      }
    }
    return '';
  };

  const getFunctionInvokeUrl = (result: string, queryParams: string) => {
    if (functionInfo) {
      let path = '/';
      const httpTriggerTypeInfo = BindingManager.getHttpTriggerTypeInfo(functionInfo.properties);
      if (httpTriggerTypeInfo && httpTriggerTypeInfo.route) {
        path += `${result}/${httpTriggerTypeInfo.route}`;
      } else {
        path += `${result}/${functionInfo.properties.name}`;
      }
      const re = new RegExp('//', 'g');
      path = path.replace(re, '/');
      path = path.replace('/?', '?') + queryParams;
      return `${getMainUrl(functionInfo.properties.name)}${path}`;
    }
    return '';
  };

  const getMainUrl = (functionName: string) => {
    return `${Url.getMainUrl(site)}/admin/functions/${functionName.toLocaleLowerCase()}`;
  };

  const run = async (newFunctionInfo: ArmObj<FunctionInfo>) => {
    const updatedFunctionInfo = await functionEditorData.updateFunctionInfo(resourceId, newFunctionInfo);
    if (updatedFunctionInfo.metadata.success) {
      const data = updatedFunctionInfo.data;
      const functionInvokeUrl = createAndGetFunctionInvokeUrl();
      let url = !!functionInvokeUrl ? functionInvokeUrl : getMainUrl(data.properties.name);
      if (!!url) {
        try {
          const parsedTestData = JSON.parse(data.properties.test_data);
          const testDataObject = functionEditorData.getProcessedFunctionTestData(parsedTestData);
          const queryString = getQueryString(testDataObject.queries);
          if (!!queryString) {
            url += '?';
          }
          url += queryString;
          // TODO (krmitta): Make the API call (using URL created above) to run function and pass the response to FunctionTest Component [WI: 5536379]
        } catch (err) {}
      }
    }
  };

  const getQueryString = (queries: KeyValuePair[]): string => {
    let queryString = '';
    for (const query of queries) {
      if (!!queryString) {
        queryString += '&';
      }
      queryString += `${query.name}=${query.value}`;
    }
    return queryString;
  };

  useEffect(() => {
    fetchData();
  }, []);

  // TODO (krmitta): Show a loading error message site or functionInfo call fails
  if (initialLoading || !site || !functionInfo) {
    return <LoadingComponent />;
  }
  return (
    <FunctionEditorContext.Provider value={functionEditorData}>
      <FunctionEditor functionInfo={functionInfo} site={site} run={run} />
    </FunctionEditorContext.Provider>
  );
};

export default FunctionEditorDataLoader;
