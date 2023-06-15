import React from 'react';
import { useTranslation } from 'react-i18next';

import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { getDescriptionSection } from '../utility/DeploymentCenterUtility';

const DeploymentCenterLocalGitProvider: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <h3>{t('deploymentCenterCodeLocalGitTitle')}</h3>

      {getDescriptionSection(
        ScmType.LocalGit,
        t('deploymentCenterCodeLocalGitDesc'),
        DeploymentCenterLinks.configureLocalGitDeployment,
        t('learnMore')
      )}

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
