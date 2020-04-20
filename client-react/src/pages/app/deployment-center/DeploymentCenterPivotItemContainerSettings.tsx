import React from 'react';

interface DeploymentCenterPivotItemContainerSettingsProps {
  resourceId: string;
}

const DeploymentCenterPivotItemContainerSettings: React.FC<DeploymentCenterPivotItemContainerSettingsProps> = props => {
  const { resourceId } = props;

  return <h2>Settings for {resourceId}</h2>;
};

export default DeploymentCenterPivotItemContainerSettings;
