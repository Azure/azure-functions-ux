import React from 'react';
import DeploymentCenter from './DeploymentCenter';

interface DeploymentCenterDataLoaderProps {
  resourceId: string;
}

const DeploymentCenterDataLoader: React.FC<DeploymentCenterDataLoaderProps> = props => {
  const { resourceId } = props;

  const loading = false;
  const hasPermission = true;

  return <DeploymentCenter resourceId={resourceId} loading={loading} hasPermission={hasPermission} />;
};

export default DeploymentCenterDataLoader;
