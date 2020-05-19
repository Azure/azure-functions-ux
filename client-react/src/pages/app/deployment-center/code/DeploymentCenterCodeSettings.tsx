import React from 'react';
// import DeploymentCenterContainerSource from './DeploymentCenterContainerSource';
import { DeploymentCenterFieldProps } from '../DeploymentCenter.types';
// import { DeploymentCenterFieldProps, ContainerRegistrySources } from '../DeploymentCenter.types';
// import { ScmTypes } from '../../../../models/site/config';
// import DeploymentCenterGitHubProvider from '../DeploymentCenterGitHubProvider';
// import DeploymentCenterContainerRegistrySettings from './DeploymentCenterContainerRegistrySettings';
// import DeploymentCenterContainerAcrSettings from './DeploymentCenterContainerAcrSettings';
// import DeploymentCenterContainerDockerHubSettings from './DeploymentCenterContainerDockeHubSettings';
// import DeploymentCenterContainerPrivateRegistrySettings from './DeploymentCenterContainerPrivateRegistrySettings';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps> = props => {
  // const { formProps } = props;
  // const isGitHubActionEnabled = formProps && formProps.values.scmType === ScmTypes.GitHubAction;
  // const isAcrConfigured = formProps && formProps.values.registrySource === ContainerRegistrySources.acr;
  // const isDockerHubConfigured = formProps && formProps.values.registrySource === ContainerRegistrySources.docker;
  // const isPrivateRegistryConfigured = formProps && formProps.values.registrySource === ContainerRegistrySources.privateRegistry;

  return <h1>Placeholder for settings</h1>;
};

export default DeploymentCenterCodeSettings;
