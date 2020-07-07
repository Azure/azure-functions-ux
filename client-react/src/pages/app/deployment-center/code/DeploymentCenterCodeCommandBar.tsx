import React from 'react';
import DeploymentCenterCommandBar from '../DeploymentCenterCommandBar';
import { DeploymentCenterCodeCommandBarProps } from '../DeploymentCenter.types';

const DeploymentCenterCodeCommandBar: React.FC<DeploymentCenterCodeCommandBarProps> = props => {
  const { isLoading, showPublishProfilePanel, refresh } = props;

  const saveFunction = async () => {
    throw Error('not implemented');
  };

  const discardFunction = () => {
    throw Error('not implemented');
  };

  return (
    <DeploymentCenterCommandBar
      saveFunction={saveFunction}
      discardFunction={discardFunction}
      showPublishProfilePanel={showPublishProfilePanel}
      refresh={refresh}
      isLoading={isLoading}
    />
  );
};

export default DeploymentCenterCodeCommandBar;
