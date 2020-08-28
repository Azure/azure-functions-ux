import React, { useContext } from 'react';
import { DeploymentCenterContainerCommandBarProps } from '../DeploymentCenter.types';
import DeploymentCenterCommandBar from '../DeploymentCenterCommandBar';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';

const DeploymentCenterContainerCommandBar: React.FC<DeploymentCenterContainerCommandBarProps> = props => {
  const { refresh, isLoading } = props;
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);

  const saveFunction = () => {
    throw Error('not implemented');
  };

  const discardFunction = () => {
    throw Error('not implemented');
  };

  return (
    <DeploymentCenterCommandBar
      saveFunction={saveFunction}
      discardFunction={discardFunction}
      showPublishProfilePanel={deploymentCenterPublishingContext.showPublishProfilePanel}
      refresh={refresh}
      isLoading={isLoading}
    />
  );
};

export default DeploymentCenterContainerCommandBar;
