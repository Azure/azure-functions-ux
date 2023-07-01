import React from 'react';
import { useTranslation } from 'react-i18next';

import { Label, Link, PrimaryButton } from '@fluentui/react';

import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { additionalTextFieldControl } from '../DeploymentCenter.styles';
import { DeploymentCenterDropboxProviderProps } from '../DeploymentCenter.types';
import { getDescriptionSection } from '../utility/DeploymentCenterUtility';

const DeploymentCenterDropboxAccount: React.FC<DeploymentCenterDropboxProviderProps> = props => {
  const { accountUser, accountStatusMessage, authorizeAccount } = props;

  const { t } = useTranslation();

  const DropboxAccountControls =
    accountUser && accountUser.name && accountUser.name.display_name ? (
      <>
        {getDescriptionSection(
          ScmType.Dropbox,
          t('deploymentCenterDropboxDescriptionText'),
          DeploymentCenterLinks.cloudFolderDeployment,
          t('learnMore')
        )}
        <ReactiveFormControl id="deployment-center-dropbox-user" label={t('deploymentCenterOAuthSingedInAs')}>
          <div>
            {accountUser.name.display_name}
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
