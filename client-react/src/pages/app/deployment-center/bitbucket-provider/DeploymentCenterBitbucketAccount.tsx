import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterBitbucketProviderProps } from '../DeploymentCenter.types';
import { PrimaryButton, Label, Link } from 'office-ui-fabric-react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl } from '../DeploymentCenter.styles';

const DeploymentCenterBitbucketAccount: React.FC<DeploymentCenterBitbucketProviderProps> = props => {
  const { accountUser, accountStatusMessage, authorizeAccount } = props;

  const { t } = useTranslation();

  const bitbucketAccountControls = accountUser ? (
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
  ) : (
    <PrimaryButton ariaDescription={t('deploymentCenterOAuthAuthorizeAriaLabel')} onClick={authorizeAccount}>
      {t('deploymentCenterOAuthAuthorize')}
    </PrimaryButton>
  );

  const accountStatusMessageControl = <Label>{accountStatusMessage}</Label>;

  return accountStatusMessage ? accountStatusMessageControl : bitbucketAccountControls;
};

export default DeploymentCenterBitbucketAccount;
