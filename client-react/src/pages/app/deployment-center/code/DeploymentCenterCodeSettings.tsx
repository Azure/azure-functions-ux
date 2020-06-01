import React from 'react';
import { DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import DeploymentCenterCodeSource from './DeploymentCenterCodeSource';
import { ScmTypes } from '../../../../models/site/config';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps> = props => {
  const { formProps } = props;
  const isGitHubActionEnabled = formProps && formProps.values.scmType === ScmTypes.GitHub;
  return (
    <>
      <DeploymentCenterCodeSource />
    </>
  );
};

export default DeploymentCenterCodeSettings;
