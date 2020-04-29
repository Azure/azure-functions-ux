import React from 'react';
import { ArmSiteDescriptor } from '../../../utils/resourceDescriptors';

export interface IDeploymentCenterContext {
  resourceId: string;
  hasWritePermission: boolean;
  siteDescriptor?: ArmSiteDescriptor;
}

export const DeploymentCenterContext = React.createContext<IDeploymentCenterContext>({} as IDeploymentCenterContext);
