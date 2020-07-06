import React, { useEffect, useState } from 'react';
import FunctionOrchestrationsData from './FunctionOrchestrations.data';
import FunctionOrchestrations from './FunctionOrchestrations';
import { AppInsightsOrchestrationTrace, AppInsightsOrchestrationTraceDetail } from '../../../../../../../models/app-insights';

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
  const [orchestrationDetails, setOrchestrationDetails] = useState<AppInsightsOrchestrationTraceDetail[] | undefined>(undefined);

  const fetchOrchestrationTraces = async () => {
    if (appInsightsToken) {
      const orchestrationTracesResponse = await orchestrationsData.getOrchestrationTraces(appInsightsAppId, appInsightsToken, resourceId);
      setOrchestrationTraces(orchestrationTracesResponse);
    }
  };

  const fetchOrchestrationTraceDetails = async () => {
    if (appInsightsToken && currentTrace) {
      const orchestrationDetailsResponse = await orchestrationsData.getOrchestrationDetails(
        appInsightsAppId,
        appInsightsToken,
        currentTrace.DurableFunctionsInstanceId
      );
      setOrchestrationDetails(orchestrationDetailsResponse);
    }
  };

  const refreshOrchestrations = () => {
    setOrchestrationTraces(undefined);
    fetchOrchestrationTraces();
  };

  useEffect(() => {
    fetchOrchestrationTraceDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrace]);
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
        orchestrationDetails={orchestrationDetails}
      />
    </FunctionOrchestrationsContext.Provider>
  );
};

export default FunctionOrchestrationsDataLoader;
