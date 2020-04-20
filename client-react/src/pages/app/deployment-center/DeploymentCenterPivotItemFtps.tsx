import React from 'react';

interface DeploymentCenterPivotItemFtpsProps {
  resourceId: string;
}

const DeploymentCenterPivotItemFtps: React.FC<DeploymentCenterPivotItemFtpsProps> = props => {
  const { resourceId } = props;

  return <h2>FTPs for {resourceId}</h2>;
};

export default DeploymentCenterPivotItemFtps;
