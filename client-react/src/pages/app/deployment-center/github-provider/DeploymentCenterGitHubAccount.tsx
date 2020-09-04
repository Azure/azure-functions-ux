import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterGitHubProviderProps } from '../DeploymentCenter.types';
import { PrimaryButton, Label, Link } from 'office-ui-fabric-react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl } from '../DeploymentCenter.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';

const DeploymentCenterGitHubAccount: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const { accountUser, accountStatusMessage, authorizeAccount } = props;
  const { t } = useTranslation();

  const gitHubAccountControls = accountUser ? (
    <>
      <p>
        <span id="deployment-center-github-permissions-message">{t('deploymentCenterConfigureGitHubPermissions')}</span>
        <Link
          id="deployment-center-github-permissions-learnMore"
          href={DeploymentCenterLinks.configureDeployment}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="deployment-center-github-permissions-message">
          {` ${t('learnMore')}`}
        </Link>
      </p>

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
