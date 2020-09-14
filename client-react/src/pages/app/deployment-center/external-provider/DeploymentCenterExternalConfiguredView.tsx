import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl } from '../DeploymentCenter.styles';
import { Link, Icon } from 'office-ui-fabric-react';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';

const DeploymentCenterExternalConfiguredView: React.FC<{}> = props => {
  const { t } = useTranslation();

  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [externalUsername, setExternalUsername] = useState<string | undefined>(undefined);
  const [isSourceControlLoading, setIsSourceControlLoading] = useState(true);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();

  const getSourceControlDetails = async () => {
    const sourceControlDetailsResponse = await deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);
    if (sourceControlDetailsResponse.metadata.success) {
      setBranch(sourceControlDetailsResponse.data.properties.branch);
      processRepo(sourceControlDetailsResponse.data.properties.repoUrl);
    } else {
      setRepo(t('deploymentCenterErrorFetchingInfo'));
      setBranch(t('deploymentCenterErrorFetchingInfo'));
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterSourceControls',
        `Failed to get source control details with error: ${getErrorMessage(sourceControlDetailsResponse.metadata.error)}`
      );
    }
    setIsSourceControlLoading(false);
  };

  const processRepo = (repoUrl: string): void => {
    const repoUrlPartsForUsername = repoUrl.replace('https://', '').split(':');
    if (repoUrlPartsForUsername.length > 1) {
      setExternalUsername(repoUrlPartsForUsername[0]);
      const repoUrlPartsForRepo = repoUrl.split('@');
      setRepo(`https://${repoUrlPartsForRepo[repoUrlPartsForRepo.length - 1]}`);
    } else {
      setRepo(repoUrl);
    }
  };

  const getBranchLink = () => {
    if (branch && repo) {
      return (
        <Link key="deployment-center-branch-link" onClick={() => window.open(repo, '_blank')} className={additionalTextFieldControl}>
          {`${branch} `}
          <Icon id={`branch-button`} iconName={'NavigateExternalInline'} />
        </Link>
      );
    }

    return <div>{`${branch}`}</div>;
  };

  useEffect(() => {
    getSourceControlDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSourceControlLoading) {
      getSourceControlDetails();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSourceControlLoading]);

  return (
    <>
      <h3>{t('deploymentCenterCodeExternalGitTitle')}</h3>
      {externalUsername && (
        <ReactiveFormControl id="deployment-center-username" label={t('deploymentCenterCodeExternalUsernameLabel')}>
          <div>{isSourceControlLoading ? t('loading') : externalUsername}</div>
        </ReactiveFormControl>
      )}
      <ReactiveFormControl id="deployment-center-repository" label={t('deploymentCenterOAuthRepository')}>
        <div>{isSourceControlLoading ? t('loading') : repo}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-branch" label={t('deploymentCenterOAuthBranch')}>
        <div>{isSourceControlLoading ? t('loading') : getBranchLink()}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterExternalConfiguredView;
