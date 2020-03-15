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
  appInsightsResourceId: string;
  appInsightsToken?: string;
}

const FunctionInvocationsDataLoader: React.FC<FunctionInvocationsDataLoaderProps> = props => {
  const { resourceId, appInsightsAppId, appInsightsResourceId, appInsightsToken } = props;
  const [monthlySummary, setMonthlySummary] = useState<AppInsightsMonthlySummary | undefined>(undefined);
  const [invocationTraces, setInvocationTraces] = useState<AppInsightsInvocationTrace[] | undefined>(undefined);

  const armFunctionDescriptor = new ArmFunctionDescriptor(resourceId);
  const functionAppName = armFunctionDescriptor.site;
  const functionName = armFunctionDescriptor.name;

  const fetchData = async () => {
    fetchMonthlySummary();
    fetchInvocationTraces();
  };

  const fetchMonthlySummary = async () => {
    if (appInsightsToken) {
      const monthlySummaryResponse = await invocationsData.getMonthlySummary(
        appInsightsAppId,
        appInsightsToken,
        functionAppName,
        functionName
      );
      setMonthlySummary(monthlySummaryResponse);
    }
  };

  const fetchInvocationTraces = async () => {
    if (appInsightsToken) {
      const invocationTracesResponse = await invocationsData.getInvocationTraces(
        appInsightsAppId,
        appInsightsToken,
        functionAppName,
        functionName
      );
      setInvocationTraces(invocationTracesResponse);
    }
  };

  const refreshInvocations = () => {
    setInvocationTraces(undefined);
    fetchInvocationTraces();
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsToken]);

  if (!appInsightsToken || !monthlySummary) {
    return <LoadingComponent />;
  }
  return (
    <FunctionInvocationsContext.Provider value={invocationsData}>
      <FunctionInvocations
        functionAppName={functionAppName}
        functionName={functionName}
        appInsightsResourceId={appInsightsResourceId}
        monthlySummary={monthlySummary}
        invocationTraces={invocationTraces}
        refreshInvocations={refreshInvocations}
      />
    </FunctionInvocationsContext.Provider>
  );
};

export default FunctionInvocationsDataLoader;
