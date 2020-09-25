import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterOneDriveProviderProps } from '../DeploymentCenter.types';
import { PrimaryButton, Label, Link } from 'office-ui-fabric-react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl } from '../DeploymentCenter.styles';

const DeploymentCenterOneDriveAccount: React.FC<DeploymentCenterOneDriveProviderProps> = props => {
  const { accountUser, accountStatusMessage, authorizeAccount } = props;

  const { t } = useTranslation();

  const OneDriveAccountControls = accountUser ? (
    <ReactiveFormControl id="deployment-center-oneDrive-user" label={t('deploymentCenterOAuthSingedInAs')}>
      <div>
        {`${accountUser.displayName}`}
        <Link
          key="deployment-center-oneDrive-change-account-link"
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

  return accountStatusMessage ? accountStatusMessageControl : OneDriveAccountControls;
};

export default DeploymentCenterOneDriveAccount;
