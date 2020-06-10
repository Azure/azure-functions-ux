import React, { useContext, useEffect, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';

const DeploymentCenterGitHubReadOnly: React.FC<{}> = () => {
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();
  const [org, setOrg] = useState<string | undefined>(undefined);
  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [repoUrl, setRepoUrl] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);

  const fetchData = async () => {
    const sourceControlDetailsResponse = await deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);

    if (sourceControlDetailsResponse.metadata.success) {
      setRepoUrl(sourceControlDetailsResponse.data.properties.repoUrl);
      setBranch(sourceControlDetailsResponse.data.properties.branch);
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
      <h1>Hello</h1>
      {/* <ReactiveFormControl id="deployment-center-source" label={t('deploymentCenterSettingsSourceLabel')}>
        <div>
          {`${gitHubUser.login}`}
          <Link
            key="deployment-center-github-change-account-link"
            onClick={authorizeGitHubAccount}
            className={additionalTextFieldControl}
            aria-label={t('deploymentCenterOAuthChangeAccount')}>
            {t('deploymentCenterOAuthChangeAccount')}
          </Link>
        </div>
      </ReactiveFormControl> */}
    </>
  );
};

export default DeploymentCenterGitHubReadOnly;
