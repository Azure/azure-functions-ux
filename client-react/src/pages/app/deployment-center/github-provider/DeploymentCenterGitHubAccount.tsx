import React from 'react';
import { useTranslation } from 'react-i18next';

import { IconButton, Label, Link, PrimaryButton, TooltipHost } from '@fluentui/react';

import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { additionalTextFieldControl, changeAccountInfoButtonStyle } from '../DeploymentCenter.styles';
import { DeploymentCenterGitHubProviderProps } from '../DeploymentCenter.types';
import { getDescriptionSection } from '../utility/DeploymentCenterUtility';

const DeploymentCenterGitHubAccount: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const { accountUser, accountStatusMessage, authorizeAccount, isGitHubActions } = props;
  const { t } = useTranslation();

  const gitHubAccountControls = accountUser ? (
    <>
      {getDescriptionSection(
        ScmType.GitHub,
        isGitHubActions ? t('deploymentCenterConfigureGitHubPermissionsGHA') : t('deploymentCenterConfigureGitHubPermissionsKudu'),
        DeploymentCenterLinks.configureDeployment,
        t('learnMore')
      )}
      <ReactiveFormControl id="deployment-center-github-user" label={t('deploymentCenterOAuthSingedInAs')}>
        <div>
          {accountUser.login}
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
