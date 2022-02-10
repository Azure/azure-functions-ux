import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterOneDriveProviderProps } from '../DeploymentCenter.types';
import { PrimaryButton, Label, Link } from '@fluentui/react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl, deploymentCenterDescriptionTextStyle } from '../DeploymentCenter.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';

const DeploymentCenterOneDriveAccount: React.FC<DeploymentCenterOneDriveProviderProps> = props => {
  const { accountUser, accountStatusMessage, authorizeAccount } = props;

  const { t } = useTranslation();

  const OneDriveAccountControls = accountUser ? (
    <>
      <p className={deploymentCenterDescriptionTextStyle}>
        <span id="deployment-center-oneDrive-description-text">{t('deploymentCenterOneDriveDescriptionText')}</span>
        <Link
          id="deployment-center-oneDrive-description-text-learnMore"
          href={DeploymentCenterLinks.cloudFolderDeployment}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="deployment-center-oneDrive-learnMore-link">
          {` ${t('learnMore')}`}
        </Link>
      </p>
      <ReactiveFormControl id="deployment-center-oneDrive-user" label={t('deploymentCenterOAuthSingedInAs')}>
        <div>
          {`${accountUser.createdBy.user.displayName}`}
          <Link
            key="deployment-center-oneDrive-change-account-link"
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

  return accountStatusMessage ? accountStatusMessageControl : OneDriveAccountControls;
};

export default DeploymentCenterOneDriveAccount;
