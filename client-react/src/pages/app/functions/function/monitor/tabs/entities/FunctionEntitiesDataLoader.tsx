import React, { useState, useEffect } from 'react';
import FunctionEntitiesData from './FunctionEntities.data';
import FunctionEntities from './FunctionEntities';
import { AppInsightsEntityTrace } from '../../../../../../../models/app-insights';

interface FunctionEntitiesDataLoaderProps {
  resourceId: string;
  appInsightsAppId: string;
  appInsightsResourceId: string;
  appInsightsToken?: string;
}

const entitiesData = new FunctionEntitiesData();
export const FunctionEntitiesContext = React.createContext(entitiesData);

const FunctionEntitiesDataLoader: React.FC<FunctionEntitiesDataLoaderProps> = props => {
  const { resourceId, appInsightsToken, appInsightsAppId, appInsightsResourceId } = props;

  const [currentTrace, setCurrentTrace] = useState<AppInsightsEntityTrace | undefined>(undefined);
  const [entityTraces, setEntityTraces] = useState<AppInsightsEntityTrace[] | undefined>(undefined);

  const fetchOrchestrationTraces = async () => {
    if (appInsightsToken) {
      const entityTracesResponse = await entitiesData.getEntityTraces(appInsightsAppId, appInsightsToken, resourceId);
      setEntityTraces(entityTracesResponse);
    }
  };

  const refreshEntities = () => {
    setEntityTraces(undefined);
    fetchOrchestrationTraces();
  };

  useEffect(() => {
    fetchOrchestrationTraces();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsToken]);
  return (
    <FunctionEntitiesContext.Provider value={entitiesData}>
      <FunctionEntities
        functionResourceId={resourceId}
        appInsightsResourceId={appInsightsResourceId}
        setCurrentTrace={setCurrentTrace}
        currentTrace={currentTrace}
        entityTraces={entityTraces}
        refreshEntities={refreshEntities}
      />
    </FunctionEntitiesContext.Provider>
  );
};

export default FunctionEntitiesDataLoader;
