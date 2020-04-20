import React from 'react';

interface DeploymentCenterPivotItemContainerLogsProps {
  resourceId: string;
}

const DeploymentCenterPivotItemContainerLogs: React.FC<DeploymentCenterPivotItemContainerLogsProps> = props => {
  const { resourceId } = props;

  return <h2>Logs for {resourceId}</h2>;
};

export default DeploymentCenterPivotItemContainerLogs;
