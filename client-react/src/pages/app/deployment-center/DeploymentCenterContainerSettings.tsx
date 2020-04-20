import React from 'react';

interface DeploymentCenterContainerSettingsProps {
  resourceId: string;
}

const DeploymentCenterContainerSettings: React.FC<DeploymentCenterContainerSettingsProps> = props => {
  const { resourceId } = props;

  return <h2>Settings for {resourceId}</h2>;
};

export default DeploymentCenterContainerSettings;
