import React from 'react';
import { DeploymentCenterFieldProps, AppTypes } from '../DeploymentCenter.types';
import DeploymentCenterCodeSource from './DeploymentCenterCodeSource';
import DeploymentCenterGitHubDataLoader from '../github-provider/DeploymentCenterGitHubDataLoader';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps> = props => {
  const { formProps } = props;
  return (
    <>
      <DeploymentCenterCodeSource />
      <DeploymentCenterGitHubDataLoader formProps={formProps} appType={AppTypes.Code} />
    </>
  );
};

export default DeploymentCenterCodeSettings;
