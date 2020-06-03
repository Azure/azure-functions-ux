import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DeploymentCenterGitHubAccount from './DeploymentCenterGitHubAccount';
import { DeploymentCenterGitHubProviderProps } from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { ScmTypes } from '../../../../models/site/config';
import DeploymentCenterGitHubReadOnly from './DeploymentCenterGitHubReadOnly';

const DeploymentCenterGitHubProvider: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const readOnly = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType !== ScmTypes.None;
  return (
    <>
      <h3>{t('deploymentCenterContainerGitHubActionsTitle')}</h3>
      {readOnly ? <DeploymentCenterGitHubReadOnly {...props} /> : <DeploymentCenterGitHubAccount {...props} />}
    </>
    //TODO (michinoy): We can start adding the github source controls here now.
  );
};

export default DeploymentCenterGitHubProvider;
