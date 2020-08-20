import React from 'react';
import { ArmSiteDescriptor } from '../../../utils/resourceDescriptors';
import { ArmObj } from '../../../models/arm-obj';
import { SiteConfig } from '../../../models/site/config';
import { KeyValue } from '../../../models/portal-models';

export interface IDeploymentCenterContext {
  resourceId: string;
  hasWritePermission: boolean;
  oneDriveToken: string;
  dropBoxToken: string;
  bitbucketToken: string;
  gitHubToken: string;
  refresh: () => void;
  refreshUserSourceControlTokens: () => void;
  siteConfig?: ArmObj<SiteConfig>;
  siteDescriptor?: ArmSiteDescriptor;
  applicationSettings?: ArmObj<KeyValue<string>>;
  configMetadata?: ArmObj<KeyValue<string>>;
}

export const DeploymentCenterContext = React.createContext<IDeploymentCenterContext>({} as IDeploymentCenterContext);
