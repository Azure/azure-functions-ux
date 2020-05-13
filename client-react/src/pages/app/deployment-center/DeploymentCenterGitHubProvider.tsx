import React from 'react';
import { useTranslation } from 'react-i18next';

const DeploymentCenterGitHubProvider: React.FC<{}> = props => {
  const { t } = useTranslation();
  return (
    <>
      <h3>{t('deploymentCenterContainerGitHubActionsTitle')}</h3>
      <p>GitHub Provider view</p>
    </>
  );
};

export default DeploymentCenterGitHubProvider;
