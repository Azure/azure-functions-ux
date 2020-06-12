import React, { useContext } from 'react';
import { DeploymentCenterFieldProps, DeploymentCenterCodeFormData } from '../DeploymentCenter.types';
import DeploymentCenterCodeSource from './DeploymentCenterCodeSource';
import DeploymentCenterGitHubDataLoader from '../github-provider/DeploymentCenterGitHubDataLoader';
import { ScmTypes } from '../../../../models/site/config';
import DeploymentCenterCodeBuild from './DeploymentCenterCodeBuild';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterGitHubReadOnly from '../github-provider/DeploymentCenterGitHubReadOnly';
import DeploymentCenterCodeBuildReadOnly from './DeploymentCenterCodeBuildReadOnly';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const isGitHubSource = formProps && formProps.values.sourceProvider === ScmTypes.GitHub;
  const isSourceSelected = formProps && formProps.values.sourceProvider !== ScmTypes.None;
  const isReadOnly = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType !== ScmTypes.None;

  const disconnectCallback = () => {
    throw Error('not implemented');
  };

  return (
    <>
      {isReadOnly ? (
        <>
          <DeploymentCenterGitHubReadOnly disconnect={disconnectCallback} />
          <DeploymentCenterCodeBuildReadOnly />
        </>
      ) : (
        <>
          <DeploymentCenterCodeSource />
          {isGitHubSource && <DeploymentCenterGitHubDataLoader formProps={formProps} />}
          {isSourceSelected && <DeploymentCenterCodeBuild formProps={formProps} />}
        </>
      )}
    </>
  );
};

export default DeploymentCenterCodeSettings;
