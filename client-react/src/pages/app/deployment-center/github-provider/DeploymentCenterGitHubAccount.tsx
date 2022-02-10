import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterGitHubProviderProps } from '../DeploymentCenter.types';
import { PrimaryButton, Label, Link, TooltipHost, IconButton } from '@fluentui/react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl, changeAccountInfoButtonStyle, deploymentCenterDescriptionTextStyle } from '../DeploymentCenter.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';

const DeploymentCenterGitHubAccount: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const { accountUser, accountStatusMessage, authorizeAccount, isGitHubActions } = props;
  const { t } = useTranslation();

  const gitHubAccountControls = accountUser ? (
    <>
      <p className={deploymentCenterDescriptionTextStyle}>
        <span id="deployment-center-github-permissions-message">
          {!!isGitHubActions ? t('deploymentCenterConfigureGitHubPermissionsGHA') : t('deploymentCenterConfigureGitHubPermissionsKudu')}
        </span>
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
          <TooltipHost content={t('deploymentCenterChangeAccountInfoMessage')} id="deployment-center-github-change-account-message">
            <IconButton
              iconProps={{ iconName: 'Info' }}
              aria-label={t('deploymentCenterChangeAccountInfoButton')}
              className={changeAccountInfoButtonStyle}
            />
          </TooltipHost>
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
