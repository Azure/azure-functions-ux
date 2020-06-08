import React from 'react';
import { DeploymentCenterFieldProps, DeploymentCenterCodeFormData } from '../DeploymentCenter.types';
import DeploymentCenterCodeSource from './DeploymentCenterCodeSource';
import DeploymentCenterGitHubDataLoader from '../github-provider/DeploymentCenterGitHubDataLoader';
import { ScmTypes } from '../../../../models/site/config';
import DeploymentCenterCodeBuild from './DeploymentCenterCodeBuild';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const isGitHubSource = formProps && formProps.values.sourceProvider === ScmTypes.GitHub;
  const isSourceSelected = formProps && formProps.values.sourceProvider !== ScmTypes.None;

  return (
    <>
      <DeploymentCenterCodeSource />
      {isGitHubSource && <DeploymentCenterGitHubDataLoader formProps={formProps} />}
      {isSourceSelected && <DeploymentCenterCodeBuild formProps={formProps} />}
    </>
  );
};

export default DeploymentCenterCodeSettings;
