import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterBitbucketProviderProps } from '../DeploymentCenter.types';
import { PrimaryButton, Label, Link } from '@fluentui/react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl, deploymentCenterDescriptionTextStyle } from '../DeploymentCenter.styles';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';

const DeploymentCenterBitbucketAccount: React.FC<DeploymentCenterBitbucketProviderProps> = props => {
  const { accountUser, accountStatusMessage, authorizeAccount } = props;

  const { t } = useTranslation();

  const bitbucketAccountControls = accountUser ? (
    <>
      <p className={deploymentCenterDescriptionTextStyle}>
        <span id="deployment-center-bitbucket-description-text">{t('deploymentCenterBitbucketDescriptionText')}</span>
        <Link
          id="deployment-center-bitbucket-description-text-learnMore"
          href={DeploymentCenterLinks.bitbucketDeployment}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="deployment-center-bitbucket-learnMore-link">
          {` ${t('learnMore')}`}
        </Link>
      </p>
      <ReactiveFormControl id="deployment-center-bitbucket-user" label={t('deploymentCenterOAuthSingedInAs')}>
        <div>
          {`${accountUser.username}`}
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
