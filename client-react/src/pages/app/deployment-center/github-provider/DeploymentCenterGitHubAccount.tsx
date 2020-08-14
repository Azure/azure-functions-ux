import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterGitHubProviderProps } from '../DeploymentCenter.types';
import { PrimaryButton, Label, Link, MessageBarType } from 'office-ui-fabric-react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl, deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';

const DeploymentCenterGitHubAccount: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const {
    accountUser,
    accountStatusMessage,
    authorizeAccount,
  } = props;
  const { t } = useTranslation();

  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const closeInfoBanner = () => {
    setShowInfoBanner(false);
  };

  const gitHubAccountControls = accountUser ? (
    <>
      {showInfoBanner && (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner
            message={t('deploymentCenterConfigureGitHubPermissions')}
            type={MessageBarType.info}
            learnMoreLink={DeploymentCenterLinks.configureDeployment}
            onDismiss={closeInfoBanner}
          />
        </div>
      )}

      <ReactiveFormControl id="deployment-center-github-user" label={t('deploymentCenterOAuthSingedInAs')}>
        <div>
          {`${accountUser.login}`}
          <Link
            key="deployment-center-github-change-account-link"
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

  return <>{accountStatusMessage ? accountStatusMessageControl : gitHubAccountControls}</>;
};

export default DeploymentCenterGitHubAccount;
