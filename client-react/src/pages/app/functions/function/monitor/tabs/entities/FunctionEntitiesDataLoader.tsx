import React, { useState, useEffect } from 'react';
import FunctionEntitiesData from './FunctionEntities.data';
import FunctionEntities from './FunctionEntities';
import { AppInsightsEntityTrace, AppInsightsEntityTraceDetail } from '../../../../../../../models/app-insights';

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
  const [entityDetails, setEntityDetails] = useState<AppInsightsEntityTraceDetail[] | undefined>(undefined);

  const fetchEntityTraces = async () => {
    if (appInsightsToken) {
      const entityTracesResponse = await entitiesData.getEntityTraces(appInsightsAppId, appInsightsToken, resourceId);
      setEntityTraces(entityTracesResponse);
    }
  };

  const refreshEntities = () => {
    setEntityTraces(undefined);
    fetchEntityTraces();
  };

  const fetchEntityTraceDetails = async () => {
    if (appInsightsToken && currentTrace) {
      const entitiesDetailsResponse = await entitiesData.getEntityDetails(
        appInsightsAppId,
        appInsightsToken,
        currentTrace.DurableFunctionsInstanceId
      );
      setEntityDetails(entitiesDetailsResponse);
    }
  };

  useEffect(() => {
    fetchEntityTraceDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrace]);

  useEffect(() => {
    fetchEntityTraces();

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
        entityDetails={entityDetails}
      />
    </FunctionEntitiesContext.Provider>
  );
};

export default FunctionEntitiesDataLoader;
