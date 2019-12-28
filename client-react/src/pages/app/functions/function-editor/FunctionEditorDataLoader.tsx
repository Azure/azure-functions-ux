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

  const siteContext = useContext(SiteRouterContext);

  const fetchData = async () => {
    const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
    const [site, functionInfo] = await Promise.all([
      siteContext.fetchSite(armSiteDescriptor.getSiteOnlyResourceId()),
      functionEditorData.getFunctionInfo(resourceId),
    ]);

    if (site.metadata.success) {
      setSite(site.data);
    }
    if (functionInfo.metadata.success) {
      setFunctionInfo(functionInfo.data);
    }
    setInitialLoading(false);
  };

  const run = async (functionInfo: ArmObj<FunctionInfo>) => {
    const updatedFunctionInfo = await functionEditorData.updateFunctionInfo(resourceId, functionInfo);
    if (updatedFunctionInfo.metadata.success) {
      const data = updatedFunctionInfo.data;
      const mainUrl = Url.getMainUrl(site);
      if (!!mainUrl) {
        let url = `${mainUrl}/admin/functions/${data.properties.name.toLocaleLowerCase()}`;
        try {
          const parsedTestData = JSON.parse(data.properties.test_data);
          const testDataObject = functionEditorData.getProcessedFunctionTestData(parsedTestData);
          const queryString = getQueryString(testDataObject.queries);
          if (!!queryString) {
            url += '?';
          }
          url += queryString;
        } catch (err) {}
        console.log('-->' + url);
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
