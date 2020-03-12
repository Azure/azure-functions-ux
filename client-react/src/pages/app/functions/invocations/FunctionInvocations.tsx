import React from 'react';
import { AppInsightsMonthlySummary, AppInsightsInvocationTrace } from '../../../../models/app-insights';

interface FunctionInvocationsProps {
  resourceId: string;
  monthlySummary: AppInsightsMonthlySummary;
  invocationTraces: AppInsightsInvocationTrace[];
}

const FunctionInvocations: React.FC<FunctionInvocationsProps> = props => {
  const { monthlySummary, invocationTraces } = props;
  return (
    <div>
      <h2>{`Success Count: ${monthlySummary.successCount}`}</h2>
      <h2>{`Error Count: ${monthlySummary.failedCount}`}</h2>
      {invocationTraces.map(trace => {
        return (
          <h5>{`Date: ${trace.timestampFriendly}\tSuccess: ${trace.success.toString()}\tResult Code: ${
            trace.resultCode
          }\tDuration: ${trace.duration.toString()}\tOperationId: ${trace.operationId}`}</h5>
        );
      })}
    </div>
  );
};

export default FunctionInvocations;
