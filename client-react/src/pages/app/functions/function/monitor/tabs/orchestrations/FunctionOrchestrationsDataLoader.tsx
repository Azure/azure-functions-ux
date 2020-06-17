import React, { useEffect, useState } from 'react';
import FunctionOrchestrationsData from './FunctionOrchestrations.data';
import FunctionOrchestrations from './FunctionOrchestrations';
import { AppInsightsOrchestrationTrace } from '../../../../../../../models/app-insights';

interface FunctionOrchestrationsDataLoaderProps {
  resourceId: string;
  appInsightsAppId: string;
  appInsightsResourceId: string;
  appInsightsToken?: string;
}

const orchestrationsData = new FunctionOrchestrationsData();
export const FunctionOrchestrationsContext = React.createContext(orchestrationsData);

const FunctionOrchestrationsDataLoader: React.FC<FunctionOrchestrationsDataLoaderProps> = props => {
  const { resourceId, appInsightsToken, appInsightsAppId, appInsightsResourceId } = props;

  const [currentTrace, setCurrentTrace] = useState<AppInsightsOrchestrationTrace | undefined>(undefined);
  const [orchestrationTraces, setOrchestrationTraces] = useState<AppInsightsOrchestrationTrace[] | undefined>(undefined);

  const fetchOrchestrationTraces = async () => {
    if (appInsightsToken) {
      const orchestrationTracesResponse = await orchestrationsData.getOrchestrationTraces(appInsightsAppId, appInsightsToken, resourceId);
      setOrchestrationTraces(orchestrationTracesResponse);
    }
  };

  const refreshOrchestrations = () => {
    setOrchestrationTraces(undefined);
    fetchOrchestrationTraces();
  };

  useEffect(() => {
    fetchOrchestrationTraces();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsToken]);
  return (
    <FunctionOrchestrationsContext.Provider value={orchestrationsData}>
      <FunctionOrchestrations
        functionResourceId={resourceId}
        appInsightsResourceId={appInsightsResourceId}
        setCurrentTrace={setCurrentTrace}
        currentTrace={currentTrace}
        orchestrationTraces={orchestrationTraces}
        refreshOrchestrations={refreshOrchestrations}
      />
    </FunctionOrchestrationsContext.Provider>
  );
};

export default FunctionOrchestrationsDataLoader;
