import React from 'react';

interface DeploymentCenterProps {
  resourceId: string;
}

const DeploymentCenter: React.FC<DeploymentCenterProps> = props => {
  const { resourceId } = props;

  return (
    <div>
      <h2>Deployment Center Preview for {resourceId}</h2>
    </div>
  );
};

export default DeploymentCenter;
