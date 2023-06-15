import { Label, Link, PrimaryButton } from '@fluentui/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { additionalTextFieldControl } from '../DeploymentCenter.styles';
import { DeploymentCenterBitbucketProviderProps } from '../DeploymentCenter.types';
import { getDescriptionSection } from '../utility/DeploymentCenterUtility';

const DeploymentCenterBitbucketAccount: React.FC<DeploymentCenterBitbucketProviderProps> = props => {
  const { accountUser, accountStatusMessage, authorizeAccount } = props;

  const { t } = useTranslation();

  const bitbucketAccountControls = accountUser ? (
    <>
      {getDescriptionSection(
        ScmType.BitbucketHg,
        t('deploymentCenterBitbucketDescriptionText'),
        DeploymentCenterLinks.bitbucketDeployment,
        t('learnMore')
      )}
      <ReactiveFormControl id="deployment-center-bitbucket-user" label={t('deploymentCenterOAuthSingedInAs')}>
        <div>
          {accountUser.username}
          <Link
            key="deployment-center-bitbucket-change-account-link"
            onClick={authorizeAccount}
            className={additionalTextFieldControl}
            aria-label={t('deploymentCenterOAuthChangeAccount')}>
            {t('deploymentCenterOAuthChangeAccount')}
          </Link>
        </div>
      </ReactiveFormControl>
    </>
  ) : (
    <PrimaryButton ariaDescription={t('deploymentCenterOAuthAuthorizeAriaLabel')} onClick={authorizeAccount}>
      {t('deploymentCenterOAuthAuthorize')}
    </PrimaryButton>
  );

  const accountStatusMessageControl = <Label>{accountStatusMessage}</Label>;

  return accountStatusMessage ? accountStatusMessageControl : bitbucketAccountControls;
};

export default DeploymentCenterBitbucketAccount;
