import React from 'react';
import { DeploymentCenterFieldProps, DeploymentCenterCodeFormData } from '../DeploymentCenter.types';
import DeploymentCenterCodeSource from './DeploymentCenterCodeSource';
import DeploymentCenterGitHubDataLoader from '../github-provider/DeploymentCenterGitHubDataLoader';
import { ScmTypes } from '../../../../models/site/config';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const isGitHubSource = formProps && formProps.values.sourceProvider === ScmTypes.GitHub;
  return (
    <>
      <DeploymentCenterCodeSource />
      {isGitHubSource && <DeploymentCenterGitHubDataLoader formProps={formProps} />}
    </>
  );
};

export default DeploymentCenterCodeSettings;
