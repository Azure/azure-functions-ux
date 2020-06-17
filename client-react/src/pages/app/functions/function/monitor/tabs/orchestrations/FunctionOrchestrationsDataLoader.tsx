import React from 'react';
import FunctionOrchestrationsData from './FunctionOrchestrations.data';
import FunctionOrchestrations from './FunctionOrchestrations';

interface FunctionOrchestrationsDataLoaderProps {
  resourceId: string;
  appInsightsAppId: string;
  appInsightsResourceId: string;
  appInsightsToken?: string;
}

const orchestrationsData = new FunctionOrchestrationsData();
export const FunctionOrchestrationsContext = React.createContext(orchestrationsData);

const FunctionOrchestrationsDataLoader: React.FC<FunctionOrchestrationsDataLoaderProps> = props => {
  const { resourceId } = props;

  return (
    <FunctionOrchestrationsContext.Provider value={orchestrationsData}>
      <FunctionOrchestrations resourceId={resourceId} />
    </FunctionOrchestrationsContext.Provider>
  );
};

export default FunctionOrchestrationsDataLoader;
