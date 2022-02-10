import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterDropboxProviderProps } from '../DeploymentCenter.types';
import { PrimaryButton, Label, Link } from '@fluentui/react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl, deploymentCenterDescriptionTextStyle } from '../DeploymentCenter.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';

const DeploymentCenterDropboxAccount: React.FC<DeploymentCenterDropboxProviderProps> = props => {
  const { accountUser, accountStatusMessage, authorizeAccount } = props;

  const { t } = useTranslation();

  const DropboxAccountControls =
    accountUser && accountUser.name && accountUser.name.display_name ? (
      <>
        <p className={deploymentCenterDescriptionTextStyle}>
          <span id="deployment-center-dropbox-description-text">{t('deploymentCenterDropboxDescriptionText')}</span>
          <Link
            id="deployment-center-dropbox-description-text-learnMore"
            href={DeploymentCenterLinks.cloudFolderDeployment}
            target="_blank"
            className={learnMoreLinkStyle}
            aria-labelledby="deployment-center-dropbox-learnMore-link">
            {` ${t('learnMore')}`}
          </Link>
        </p>
        <ReactiveFormControl id="deployment-center-dropbox-user" label={t('deploymentCenterOAuthSingedInAs')}>
          <div>
            {`${accountUser.name.display_name}`}
            <Link
              key="deployment-center-dropbox-change-account-link"
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

  return accountStatusMessage ? accountStatusMessageControl : DropboxAccountControls;
};

export default DeploymentCenterDropboxAccount;
