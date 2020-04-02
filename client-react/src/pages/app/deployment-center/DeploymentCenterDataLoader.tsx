import React from 'react';
import DeploymentCenter from './DeploymentCenter';

interface DeploymentCenterDataLoaderProps {
  resourceId: string;
}

const DeploymentCenterDataLoader: React.FC<DeploymentCenterDataLoaderProps> = props => {
  const { resourceId } = props;

  return <DeploymentCenter resourceId={resourceId} />;
};

export default DeploymentCenterDataLoader;
