import React from 'react';
import { PublishingCredentialPolicies } from '../../../models/site/site';
import { ArmObj } from '../../../models/arm-obj';
import { PublishingCredentials, PublishingUser, PublishingProfile } from '../../../models/site/publish';

export interface IDeploymentCenterPublishingContext {
  showPublishProfilePanel: () => void;
  resetApplicationPassword: () => void;
  publishingUserFetchFailedMessage: string;
  basicPublishingCredentialsPolicies?: PublishingCredentialPolicies;
  publishingCredentials?: ArmObj<PublishingCredentials>;
  publishingUser?: ArmObj<PublishingUser>;
  publishingProfile?: PublishingProfile;
}

export const DeploymentCenterPublishingContext = React.createContext<IDeploymentCenterPublishingContext>(
  {} as IDeploymentCenterPublishingContext
);
