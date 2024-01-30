import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterBitbucketAccountProps } from '../DeploymentCenter.types';
import { PrimaryButton, Label, Link } from '@fluentui/react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl, authorizeButtonStyle } from '../DeploymentCenter.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { getDescriptionSection } from '../utility/DeploymentCenterUtility';
import { ScmType } from '../../../../models/site/config';

const DeploymentCenterBitbucketAccount: React.FC<DeploymentCenterBitbucketAccountProps> = props => {
  const { accountUser, accountStatusMessage, authorizeAccount, isExternalGit } = props;

  const { t } = useTranslation();

  const bitbucketAccountControls = accountUser ? (
    <>
      {!isExternalGit &&
        getDescriptionSection(
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
    <ReactiveFormControl id="deployment-center-bitbucket-oauth" label={t('deploymentCenterAccountSignIn')}>
      <div className={authorizeButtonStyle}>
        <PrimaryButton ariaDescription={t('deploymentCenterOAuthAuthorizeAriaLabel')} onClick={authorizeAccount}>
          {t('deploymentCenterOAuthAuthorize')}
        </PrimaryButton>
      </div>
    </ReactiveFormControl>
  );

  const accountStatusMessageControl = <Label>{accountStatusMessage}</Label>;

  return accountStatusMessage ? accountStatusMessageControl : bitbucketAccountControls;
};

export default DeploymentCenterBitbucketAccount;
