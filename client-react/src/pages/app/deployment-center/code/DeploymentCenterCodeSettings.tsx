import React from 'react';
import { DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import DeploymentCenterGitHubDataLoader from '../github-provider/DeploymentCenterGitHubDataLoader';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps> = props => {
  return <DeploymentCenterGitHubDataLoader />;
};

export default DeploymentCenterCodeSettings;
