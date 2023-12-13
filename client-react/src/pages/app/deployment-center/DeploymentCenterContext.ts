import React from 'react';
import { ArmObj } from '../../../models/arm-obj';
import { KeyValue } from '../../../models/portal-models';
import { SiteConfig } from '../../../models/site/config';
import { ArmSiteDescriptor } from '../../../utils/resourceDescriptors';

export interface IDeploymentCenterContext {
  resourceId: string;
  hasWritePermission: boolean;
  bitbucketToken: string;
  gitHubToken: string;
  refresh: () => Promise<void>;
  refreshUserSourceControlTokens: () => void;
  isIlbASE: boolean;
  siteConfig?: ArmObj<SiteConfig>;
  siteDescriptor?: ArmSiteDescriptor;
  applicationSettings?: ArmObj<KeyValue<string>>;
  configMetadata?: ArmObj<KeyValue<string>>;
}

export const DeploymentCenterContext = React.createContext<IDeploymentCenterContext>({} as IDeploymentCenterContext);
