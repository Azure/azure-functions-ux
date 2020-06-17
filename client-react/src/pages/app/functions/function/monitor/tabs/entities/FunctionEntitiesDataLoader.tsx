import React from 'react';
import FunctionEntitiesData from './FunctionEntities.data';
import FunctionEntities from './FunctionEntities';

interface FunctionEntitiesDataLoaderProps {
  resourceId: string;
  appInsightsAppId: string;
  appInsightsResourceId: string;
  appInsightsToken?: string;
}

const entitiesData = new FunctionEntitiesData();
export const FunctionEntitiesContext = React.createContext(entitiesData);

const FunctionEntitiesDataLoader: React.FC<FunctionEntitiesDataLoaderProps> = props => {
  const { resourceId } = props;

  return (
    <FunctionEntitiesContext.Provider value={entitiesData}>
      <FunctionEntities resourceId={resourceId} />
    </FunctionEntitiesContext.Provider>
  );
};

export default FunctionEntitiesDataLoader;
