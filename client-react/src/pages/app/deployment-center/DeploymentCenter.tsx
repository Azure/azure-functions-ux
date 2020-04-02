import React from 'react';

interface DeploymentCenterProps {
  resourceId: string;
}

const DeploymentCenter: React.FC<DeploymentCenterProps> = props => {
  return (
    <div>
      <h2>Deployment Center Perview for {props.resourceId}</h2>
    </div>
  );
};

export default DeploymentCenter;
