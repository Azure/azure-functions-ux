import React from 'react';
import { DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import DeploymentCenterCodeSource from './DeploymentCenterCodeSource';

const DeploymentCenterCodeSettings: React.FC<DeploymentCenterFieldProps> = props => {
  return (
    <>
      <DeploymentCenterCodeSource />
    </>
  );
};

export default DeploymentCenterCodeSettings;
