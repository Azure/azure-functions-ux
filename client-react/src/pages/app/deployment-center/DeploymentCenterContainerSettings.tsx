import React, { useContext } from 'react';
import { DeploymentCenterContext } from './DeploymentCenterContext';

const DeploymentCenterContainerSettings: React.FC<{}> = props => {
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  return <h2>Settings for {deploymentCenterContext && deploymentCenterContext.resourceId}</h2>;
};

export default DeploymentCenterContainerSettings;
