import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';

const DeploymentCenterLocalGitProvider: React.FC<{}> = props => {
  const { t } = useTranslation();

  return (
    <>
      <h3>{t('deploymentCenterCodeLocalGitTitle')}</h3>

      <ReactiveFormControl id="deployment-center-localgit-repository" label={t('deploymentCenterOAuthRepository')}>
        <div>{t('deploymentCenterCodeLocalGitRepositorySetupMessage')}</div>
      </ReactiveFormControl>

      <ReactiveFormControl id="deployment-center-localgit-branch" label={t('deploymentCenterOAuthBranch')}>
        <div>{t('deploymentCenterCodeLocalGitBranchSetupMessage')}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterLocalGitProvider;
