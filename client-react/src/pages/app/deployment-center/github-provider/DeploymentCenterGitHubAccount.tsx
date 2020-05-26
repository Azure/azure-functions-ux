import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterGitHubProviderProps } from '../DeploymentCenter.types';
import { PrimaryButton, Label } from 'office-ui-fabric-react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';

const DeploymentCenterGitHubAccount: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const { gitHubUser, gitHubAccountStatusMessage, authorizeGitHubAccount } = props;
  const { t } = useTranslation();

  const gitHubAccountControls = gitHubUser ? (
    <ReactiveFormControl id="deployment-center-github-user" label={t('deploymentCenterOAuthSingedInAs')}>
      {`${gitHubUser.login}`}
      <a href="#" onClick={authorizeGitHubAccount}>
        {t('deploymentCenterOAuthChangeAccount')}
      </a>
    </ReactiveFormControl>
  ) : (
    <PrimaryButton ariaDescription={t('deploymentCenterOAuthAuthorizeAriaLabel')} onClick={authorizeGitHubAccount}>
      {t('deploymentCenterOAuthAuthorize')}
    </PrimaryButton>
  );

  const gitHubAccountStatusMessageControl = <Label>{gitHubAccountStatusMessage}</Label>;

  return <>{gitHubAccountStatusMessage ? gitHubAccountStatusMessageControl : gitHubAccountControls}</>;
};

export default DeploymentCenterGitHubAccount;
