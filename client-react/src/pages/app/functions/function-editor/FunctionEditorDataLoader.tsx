import React, { useState, useEffect, useContext } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import LoadingComponent from '../../../../components/loading/loading-component';
import { FunctionEditor } from './FunctionEditor';
import { ArmSiteDescriptor } from '../../../../utils/resourceDescriptors';
import FunctionEditorData from './FunctionEditor.data';
import { Site } from '../../../../models/site/site';
import { SiteRouterContext } from '../../SiteRouter';

interface FunctionEditorDataLoaderProps {
  resourceId: string;
}

const functionEditorData = new FunctionEditorData();
export const FunctionEditorContext = React.createContext(functionEditorData);

const FunctionEditorDataLoader: React.FC<FunctionEditorDataLoaderProps> = props => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [site, setSite] = useState<ArmObj<Site> | undefined>(undefined);
  const [functionInfo, setFunctionInfo] = useState<ArmObj<FunctionInfo> | undefined>(undefined);

  const siteContext = useContext(SiteRouterContext);

  const fetchData = async () => {
    const { resourceId } = props;
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

  useEffect(() => {
    fetchData();
  }, []);
  // TODO (krmitta): Show a loading error message site or functionInfo call fails
  if (initialLoading || !site || !functionInfo) {
    return <LoadingComponent />;
  }
  return (
    <FunctionEditorContext.Provider value={functionEditorData}>
      <FunctionEditor functionInfo={functionInfo} site={site} />
    </FunctionEditorContext.Provider>
  );
};

export default FunctionEditorDataLoader;
