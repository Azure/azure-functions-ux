import React, { useEffect, useState } from 'react';
import AppFilesData from './AppFiles.data';
import AppFiles from './AppFiles';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import SiteService from '../../../ApiHelpers/SiteService';
import LoadingComponent from '../../../components/loading/loading-component';

interface AppFilesDataLoaderProps {
  resourceId: string;
}

const appFilesData = new AppFilesData();
export const AppFilesContext = React.createContext(appFilesData);

const AppFilesDataLoader: React.FC<AppFilesDataLoaderProps> = props => {
  const { resourceId } = props;
  const [initialLoading, setInitialLoading] = useState(true);
  const [site, setSite] = useState<ArmObj<Site> | undefined>(undefined);

  const fetchData = async () => {
    const siteResponse = await SiteService.fetchSite(resourceId);
    if (siteResponse.metadata.success) {
      setSite(siteResponse.data);
    }
    setInitialLoading(false);
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (initialLoading) {
    return <LoadingComponent />;
  }
  return (
    <AppFilesContext.Provider value={appFilesData}>
      <AppFiles site={site} />
    </AppFilesContext.Provider>
  );
};

export default AppFilesDataLoader;
