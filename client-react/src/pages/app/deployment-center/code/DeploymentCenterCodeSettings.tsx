import React, { useContext } from 'react';
import { DeploymentCenterFieldProps, DeploymentCenterCodeFormData } from '../DeploymentCenter.types';
import DeploymentCenterGitHubDataLoader from '../github-provider/DeploymentCenterGitHubDataLoader';
import { ScmType, BuildProvider } from '../../../../models/site/config';
import DeploymentCenterCodeBuild from './DeploymentCenterCodeBuild';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterGitHubReadOnly from '../github-provider/DeploymentCenterGitHubReadOnly';
import DeploymentCenterCodeBuildReadOnly from './DeploymentCenterCodeBuildReadOnly';
import DeploymentCenterGitHubWorkflowConfig from '../github-provider/DeploymentCenterGitHubWorkflowConfig';
import DeploymentCenterGitHubWorkflowConfigSelector from '../github-provider/DeploymentCenterGitHubWorkflowConfigSelector';
import DeploymentCenterCodeSource from './DeploymentCenterCodeSource';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const isSourceSelected = formProps && formProps.values.sourceProvider !== ScmType.None;
  const isGitHubSource = formProps && formProps.values.sourceProvider === ScmType.GitHub;
  const isGitHubActionsBuild = formProps && formProps.values.buildProvider === BuildProvider.GitHubAction;
  const isDeploymentSetup = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType !== ScmType.None;

  const disconnectCallback = () => {
    throw Error('not implemented');
  };

  return (
    <>
      {isDeploymentSetup ? (
        <>
          <DeploymentCenterGitHubReadOnly disconnect={disconnectCallback} />
          <DeploymentCenterCodeBuildReadOnly />
        </>
      ) : (
        <>
          <DeploymentCenterCodeSource />
          {isGitHubSource && (
            <>
              <DeploymentCenterGitHubDataLoader formProps={formProps} />
              {isGitHubActionsBuild && <DeploymentCenterGitHubWorkflowConfigSelector formProps={formProps} />}
            </>
          )}
          {isSourceSelected && <DeploymentCenterCodeBuild formProps={formProps} />}
          <DeploymentCenterGitHubWorkflowConfig formProps={formProps} />
        </>
      )}
    </>
  );
};

export default DeploymentCenterCodeSettings;
