import React from 'react';

import { ArmObj } from '../../../models/arm-obj';
import { PublishingCredentials, PublishingProfile, PublishingUser } from '../../../models/site/publish';
import { PublishingCredentialPolicies } from '../../../models/site/site';

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
