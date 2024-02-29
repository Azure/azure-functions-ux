import React from 'react';
import { PublishingCredentialPoliciesContext } from '../../../../models/site/site';
import { ArmObj } from '../../../../models/arm-obj';
import { PublishingCredentials, PublishingProfile, PublishingUser } from '../../../../models/site/publish';

export interface IDeploymentCenterPublishingContext {
  showPublishProfilePanel: () => void;
  resetApplicationPassword: () => void;
  publishingUserFetchFailedMessage: string;
  basicPublishingCredentialsPolicies?: PublishingCredentialPoliciesContext;
  publishingCredentials?: ArmObj<PublishingCredentials>;
  publishingUser?: ArmObj<PublishingUser>;
  publishingProfile?: PublishingProfile;
}

export const DeploymentCenterPublishingContext = React.createContext<IDeploymentCenterPublishingContext>(
  {} as IDeploymentCenterPublishingContext
);
