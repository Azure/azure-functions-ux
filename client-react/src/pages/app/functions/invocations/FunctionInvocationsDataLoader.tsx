import React, { useEffect, useState } from 'react';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import FunctionInvocationsData from './FunctionInvocations.data';
import FunctionInvocations from './FunctionInvocations';
import { AppInsightsMonthlySummary, AppInsightsInvocationTrace } from '../../../../models/app-insights';
import { ArmFunctionDescriptor } from '../../../../utils/resourceDescriptors';

const invocationsData = new FunctionInvocationsData();
export const FunctionInvocationsContext = React.createContext(invocationsData);

interface FunctionInvocationsDataLoaderProps {
  resourceId: string;
  appInsightsAppId: string;
  appInsightsToken?: string;
}

const FunctionInvocationsDataLoader: React.FC<FunctionInvocationsDataLoaderProps> = props => {
  const { resourceId, appInsightsAppId, appInsightsToken } = props;
  const [monthlySummary, setMonthlySummary] = useState<AppInsightsMonthlySummary | undefined>(undefined);
  const [invocationTraces, setInvocationTraces] = useState<AppInsightsInvocationTrace[] | undefined>(undefined);

  const armFunctionDescriptor = new ArmFunctionDescriptor(resourceId);

  const fetchData = async () => {
    if (appInsightsToken) {
      const [monthlySummaryResponse, invocationTracesResponse] = await Promise.all([
        invocationsData.getMonthlySummary(appInsightsAppId, appInsightsToken, armFunctionDescriptor.site, armFunctionDescriptor.name),
        invocationsData.getInvocationTraces(appInsightsAppId, appInsightsToken, armFunctionDescriptor.site, armFunctionDescriptor.name),
      ]);
      setMonthlySummary(monthlySummaryResponse);
      setInvocationTraces(invocationTracesResponse);
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsToken]);

  if (!monthlySummary || !invocationTraces) {
    return <LoadingComponent />;
  }
  return (
    <FunctionInvocationsContext.Provider value={invocationsData}>
      <FunctionInvocations resourceId={resourceId} monthlySummary={monthlySummary} invocationTraces={invocationTraces} />
    </FunctionInvocationsContext.Provider>
  );
};

export default FunctionInvocationsDataLoader;
