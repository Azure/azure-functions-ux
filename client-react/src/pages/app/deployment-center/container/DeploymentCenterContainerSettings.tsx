import React from 'react';
import DeploymentCenterContainerSource from './DeploymentCenterContainerSource';
import { ContainerRegistrySources, DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { ScmTypes } from '../../../../models/site/config';
import DeploymentCenterContainerRegistrySettings from './DeploymentCenterContainerRegistrySettings';
import DeploymentCenterContainerAcrSettings from './DeploymentCenterContainerAcrSettings';
import DeploymentCenterContainerDockerHubSettings from './DeploymentCenterContainerDockeHubSettings';
import DeploymentCenterContainerPrivateRegistrySettings from './DeploymentCenterContainerPrivateRegistrySettings';
import DeploymentCenterGitHubDataLoader from '../github-provider/DeploymentCenterGitHubDataLoader';

const DeploymentCenterContainerSettings: React.FC<DeploymentCenterFieldProps> = props => {
  const { formProps } = props;
  const isGitHubActionEnabled = formProps && formProps.values.scmType === ScmTypes.GitHubAction;
  const isAcrConfigured = formProps && formProps.values.registrySource === ContainerRegistrySources.acr;
  const isDockerHubConfigured = formProps && formProps.values.registrySource === ContainerRegistrySources.docker;
  const isPrivateRegistryConfigured = formProps && formProps.values.registrySource === ContainerRegistrySources.privateRegistry;

  return (
    <>
      <DeploymentCenterContainerSource />

      {isGitHubActionEnabled && <DeploymentCenterGitHubDataLoader formProps={formProps} />}

      <DeploymentCenterContainerRegistrySettings {...props} />

      {isAcrConfigured && <DeploymentCenterContainerAcrSettings />}

      {isDockerHubConfigured && <DeploymentCenterContainerDockerHubSettings />}

      {isPrivateRegistryConfigured && <DeploymentCenterContainerPrivateRegistrySettings />}
    </>
  );
};

export default DeploymentCenterContainerSettings;
