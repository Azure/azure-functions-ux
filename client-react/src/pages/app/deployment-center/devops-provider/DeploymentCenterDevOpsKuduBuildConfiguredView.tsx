import React, { useContext, useEffect, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterCodeFormData, DeploymentCenterFieldProps } from '../DeploymentCenter.types';

const DeploymentCenterDevOpsKuduBuildConfiguredView: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const [repoUrl, setRepoUrl] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [isSourceControlLoading, setIsSourceControlLoading] = useState(true);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();

  const fetchSourceControlDetails = async () => {
    const sourceControlDetailsResponse = await deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);
    if (sourceControlDetailsResponse.metadata.success) {
      setRepoUrl(sourceControlDetailsResponse.data.properties.repoUrl);
      setBranch(sourceControlDetailsResponse.data.properties.branch);
    } else {
      setRepoUrl(t('deploymentCenterErrorFetchingInfo'));
      setBranch(t('deploymentCenterErrorFetchingInfo'));
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterSourceControls',
        `Failed to get source control details with error: ${getErrorMessage(sourceControlDetailsResponse.metadata.error)}`
      );
    }
    setIsSourceControlLoading(false);
  };

  const getRepoUrlValue = (isLoading: boolean) => {
    if (isLoading && formProps && formProps.values.repo) {
      return formProps.values.repo;
    } else if (isLoading && (!formProps || !formProps.values.repo)) {
      return t('loading');
    }
    return repoUrl;
  };

  const getBranchValue = (isLoading: boolean) => {
    if (isLoading && formProps && formProps.values.branch) {
      return formProps.values.branch;
    } else if (isLoading && (!formProps || !formProps.values.branch)) {
      return t('loading');
    }
    return branch;
  };

  useEffect(() => {
    fetchSourceControlDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRepoUrl(getRepoUrlValue(isSourceControlLoading));
    setBranch(getBranchValue(isSourceControlLoading));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSourceControlLoading]);

  return (
    <>
      <h3>{t('deploymentCenterCodeSettingsSourceAzureRepos')}</h3>
      <ReactiveFormControl id="deployment-center-repository" label={t('deploymentCenterOAuthRepository')}>
        <div>{repoUrl}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-bitbucket-branch" label={t('deploymentCenterOAuthBranch')}>
        <div>{branch}</div>
      </ReactiveFormControl>
    </>
  );
};
export default DeploymentCenterDevOpsKuduBuildConfiguredView;
