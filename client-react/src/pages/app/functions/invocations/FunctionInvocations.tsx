import React from 'react';
import { AppInsightsMonthlySummary } from '../../../../models/app-insights';

interface FunctionInvocationsProps {
  resourceId: string;
  monthlySummary: AppInsightsMonthlySummary;
}

const FunctionInvocations: React.FC<FunctionInvocationsProps> = props => {
  const { monthlySummary } = props;
  return (
    <div>
      <h2>{`Success Count: ${monthlySummary.successCount}`}</h2>
      <h2>{`Error Count: ${monthlySummary.failedCount}`}</h2>
    </div>
  );
};

export default FunctionInvocations;
