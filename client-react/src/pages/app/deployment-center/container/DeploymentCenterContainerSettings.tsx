import React from 'react';
import DeploymentCenterContainerSource from './DeploymentCenterContainerSource';
import { ContainerRegistrySources, DeploymentCenterFieldProps, DeploymentCenterContainerFormData } from '../DeploymentCenter.types';
import { ScmType } from '../../../../models/site/config';
import DeploymentCenterContainerRegistrySettings from './DeploymentCenterContainerRegistrySettings';
import DeploymentCenterContainerAcrSettings from './DeploymentCenterContainerAcrSettings';
import DeploymentCenterContainerDockerHubSettings from './DeploymentCenterContainerDockeHubSettings';
import DeploymentCenterContainerPrivateRegistrySettings from './DeploymentCenterContainerPrivateRegistrySettings';
import DeploymentCenterGitHubDataLoader from '../github-provider/DeploymentCenterGitHubDataLoader';

const DeploymentCenterContainerSettings: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const isGitHubActionEnabled = formProps.values.scmType === ScmType.GitHubAction;
  const isAcrConfigured = formProps.values.registrySource === ContainerRegistrySources.acr;
  const isDockerHubConfigured = formProps.values.registrySource === ContainerRegistrySources.docker;
  const isPrivateRegistryConfigured = formProps.values.registrySource === ContainerRegistrySources.privateRegistry;

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
