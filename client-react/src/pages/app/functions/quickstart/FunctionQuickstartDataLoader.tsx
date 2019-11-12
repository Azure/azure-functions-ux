import React, { useEffect, useState, useContext } from 'react';
import LoadingComponent from '../../../../components/loading/loading-component';
import { SiteRouterContext } from '../../SiteRouter';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import FunctionQuickstartData from './FunctionQuickstart.data';
import FunctionQuickstart from './FunctionQuickstart';

const quickstartData = new FunctionQuickstartData();
export const FunctionQuickstartContext = React.createContext(quickstartData);

interface FunctionQuickstartDataLoaderProps {
  resourceId: string;
}

const FunctionQuickstartDataLoader: React.FC<FunctionQuickstartDataLoaderProps> = props => {
  const { resourceId } = props;
  const [initialLoading, setInitialLoading] = useState(true);
  const [site, setSite] = useState<ArmObj<Site> | undefined>(undefined);

  const siteContext = useContext(SiteRouterContext);

  const fetchData = async () => {
    const siteData = await siteContext.fetchSite(resourceId);
    setSite(siteData.data);
    setInitialLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (initialLoading || !site) {
    return <LoadingComponent />;
  }
  return (
    <FunctionQuickstartContext.Provider value={quickstartData}>
      <FunctionQuickstart resourceId={resourceId} site={site} />
    </FunctionQuickstartContext.Provider>
  );
};

export default FunctionQuickstartDataLoader;
