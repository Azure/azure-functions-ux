import { ArmObj } from '../models/arm-obj';
import { PublishingCredentialPolicies, PublishingCredentialPolicyType } from '../models/site/site';
import StringUtils from './string';

const getBasicPublishingCrendentialPolicy = (
  basicPublishingCrendentialPolicies?: ArmObj<PublishingCredentialPolicies>[] | null,
  type?: PublishingCredentialPolicyType
): ArmObj<PublishingCredentialPolicies> | undefined => {
  return basicPublishingCrendentialPolicies?.find(policy => StringUtils.equalsIgnoreCase(policy.name, type));
};

export const getBasicPublishingCredentialsFTPPolicies = (
  basicPublishingCrendentialPolicies?: ArmObj<PublishingCredentialPolicies>[] | null
): ArmObj<PublishingCredentialPolicies> | undefined => {
  return getBasicPublishingCrendentialPolicy(basicPublishingCrendentialPolicies, PublishingCredentialPolicyType.FTP);
};

export const getBasicPublishingCredentialsSCMPolicies = (
  basicPublishingCrendentialPolicies?: ArmObj<PublishingCredentialPolicies>[] | null
): ArmObj<PublishingCredentialPolicies> | undefined => {
  return getBasicPublishingCrendentialPolicy(basicPublishingCrendentialPolicies, PublishingCredentialPolicyType.SCM);
};
