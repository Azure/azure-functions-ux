import React, { useEffect, useState } from 'react';
import FunctionInvocationsData from './FunctionInvocations.data';
import FunctionInvocations from './FunctionInvocations';
import {
  AppInsightsMonthlySummary,
  AppInsightsInvocationTrace,
  AppInsightsInvocationTraceDetail,
} from '../../../../../models/app-insights';

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
  const [currentTrace, setCurrentTrace] = useState<AppInsightsInvocationTrace | undefined>(undefined);
  const [invocationDetails, setInvocationDetails] = useState<AppInsightsInvocationTraceDetail[] | undefined>(undefined);

  const fetchData = async () => {
    fetchMonthlySummary();
    fetchInvocationTraces();
  };

  const fetchMonthlySummary = async () => {
    if (appInsightsToken) {
      const monthlySummaryResponse = await invocationsData.getMonthlySummary(appInsightsAppId, appInsightsToken, resourceId);
      setMonthlySummary(monthlySummaryResponse);
    }
  };

  const fetchInvocationTraces = async () => {
    if (appInsightsToken) {
      const invocationTracesResponse = await invocationsData.getInvocationTraces(appInsightsAppId, appInsightsToken, resourceId);
      setInvocationTraces(invocationTracesResponse);
    }
  };

  const refreshInvocations = () => {
    setInvocationTraces(undefined);
    fetchInvocationTraces();
  };

  const fetchInvocationTraceDetails = async () => {
    if (appInsightsToken && currentTrace) {
      const invocationDetailsResponse = await invocationsData.getInvocationDetails(
        appInsightsAppId,
        appInsightsToken,
        currentTrace.operationId,
        currentTrace.invocationId
      );
      setInvocationDetails(invocationDetailsResponse);
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsToken]);

  useEffect(() => {
    fetchInvocationTraceDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrace]);

  return (
    <FunctionInvocationsContext.Provider value={invocationsData}>
      <FunctionInvocations
        functionResourceId={resourceId}
        appInsightsResourceId={appInsightsResourceId}
        monthlySummary={monthlySummary}
        invocationTraces={invocationTraces}
        refreshInvocations={refreshInvocations}
        setCurrentTrace={setCurrentTrace}
        currentTrace={currentTrace}
        invocationDetails={invocationDetails}
      />
    </FunctionInvocationsContext.Provider>
  );
};

export default FunctionInvocationsDataLoader;
