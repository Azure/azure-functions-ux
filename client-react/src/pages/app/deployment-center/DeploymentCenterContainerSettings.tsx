import React from 'react';
import { DeploymentCenterContainerSettingsProps } from './DeploymentCenter.types';

const DeploymentCenterContainerSettings: React.FC<DeploymentCenterContainerSettingsProps> = props => {
  const { resourceId } = props;

  return <h2>Settings for {resourceId}</h2>;
};

export default DeploymentCenterContainerSettings;
