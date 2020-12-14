import { Link } from 'office-ui-fabric-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';

const DeploymentCenterLocalGitProvider: React.FC<{}> = props => {
  const { t } = useTranslation();

  return (
    <>
      <h3>{t('deploymentCenterCodeLocalGitTitle')}</h3>

      <p>
        <span id="deployment-center-local-git-desc">{t('deploymentCenterCodeLocalGitDesc')}</span>
        <Link
          id="deployment-center-local-git-desc-link"
          href={DeploymentCenterLinks.configureLocalGitDeployment}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="deployment-center-local-git-desc-link">
          {` ${t('click here.')}`}
        </Link>
      </p>

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
