import React from 'react';
import { useTranslation } from 'react-i18next';
import DeploymentCenterGitHubAccount from './DeploymentCenterGitHubAccount';
import { DeploymentCenterGitHubProviderProps } from '../DeploymentCenter.types';

const DeploymentCenterGitHubProvider: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const { t } = useTranslation();
  return (
    <>
      <h3>{t('deploymentCenterContainerGitHubActionsTitle')}</h3>
      <DeploymentCenterGitHubAccount {...props} />

      <p>The GitHub Source form will go here</p>
    </>
  );
};

export default DeploymentCenterGitHubProvider;
