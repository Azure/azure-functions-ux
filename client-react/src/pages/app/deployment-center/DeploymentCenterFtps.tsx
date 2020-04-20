import React from 'react';

interface DeploymentCenterFtpsProps {
  resourceId: string;
}

const DeploymentCenterFtps: React.FC<DeploymentCenterFtpsProps> = props => {
  const { resourceId } = props;

  return <h2>FTPs for {resourceId}</h2>;
};

export default DeploymentCenterFtps;
