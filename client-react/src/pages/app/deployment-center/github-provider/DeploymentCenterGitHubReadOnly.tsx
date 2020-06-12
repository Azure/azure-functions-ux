import React, { useContext, useEffect, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { useTranslation } from 'react-i18next';

const DeploymentCenterGitHubReadOnly: React.FC<{}> = () => {
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();
  const [org, setOrg] = useState<string | undefined>(undefined);
  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [repoUrl, setRepoUrl] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const { t } = useTranslation();

  const fetchData = async () => {
    const sourceControlDetailsResponse = await deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);

    if (sourceControlDetailsResponse.metadata.success) {
      setRepoUrl(sourceControlDetailsResponse.data.properties.repoUrl);
      setBranch(sourceControlDetailsResponse.data.properties.branch);

      const repoUrlSplit = sourceControlDetailsResponse.data.properties.repoUrl.split('/');
      setOrg(repoUrlSplit[repoUrlSplit.length - 2]);
      setRepo(repoUrlSplit[repoUrlSplit.length - 1]);
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterSourceControls',
        `Failed to get source control details with error: ${getErrorMessage(sourceControlDetailsResponse.metadata.error)}`
      );
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ReactiveFormControl id="deployment-center-organization" label={t('deploymentCenterOAuthOrganization')}>
        <div>{`${branch}`}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-repository" label={t('deploymentCenterOAuthRepository')}>
        <div>{`${branch}`}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-branch" label={t('deploymentCenterOAuthBranch')}>
        <div>{`${branch}`}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterGitHubReadOnly;
