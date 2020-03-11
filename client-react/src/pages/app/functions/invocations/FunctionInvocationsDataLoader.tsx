import React, { useEffect, useState } from 'react';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import FunctionInvocationsData from './FunctionInvocations.data';
import FunctionInvocations from './FunctionInvocations';
import { AppInsightsMonthlySummary } from '../../../../models/app-insights';

const invocationsData = new FunctionInvocationsData();
export const FunctionInvocationsContext = React.createContext(invocationsData);

interface FunctionInvocationsDataLoaderProps {
  resourceId: string;
  appInsightsComponentId: string;
  appInsightsToken?: string;
}

const FunctionInvocationsDataLoader: React.FC<FunctionInvocationsDataLoaderProps> = props => {
  const { resourceId, appInsightsComponentId, appInsightsToken } = props;
  const [monthlySummary, setMonthlySummary] = useState<AppInsightsMonthlySummary | undefined>(undefined);

  const fetchData = async () => {
    if (appInsightsToken) {
      const monthlySummaryResponse = await invocationsData.getMonthlySummary(
        appInsightsComponentId,
        appInsightsToken,
        'allisonm-bundles',
        'HttpTrigger1'
      );
      setMonthlySummary(monthlySummaryResponse);
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsToken]);

  if (!monthlySummary) {
    return <LoadingComponent />;
  }
  return (
    <FunctionInvocationsContext.Provider value={invocationsData}>
      <FunctionInvocations resourceId={resourceId} monthlySummary={monthlySummary} />
    </FunctionInvocationsContext.Provider>
  );
};

export default FunctionInvocationsDataLoader;
