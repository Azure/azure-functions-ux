import React from 'react';

interface DeploymentCenterContainerLogsProps {
  resourceId: string;
}

const DeploymentCenterContainerLogs: React.FC<DeploymentCenterContainerLogsProps> = props => {
  const { resourceId } = props;

  return <h2>Logs for {resourceId}</h2>;
};

export default DeploymentCenterContainerLogs;
