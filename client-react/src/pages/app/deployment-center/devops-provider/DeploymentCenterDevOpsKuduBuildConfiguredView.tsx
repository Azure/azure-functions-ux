import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { PortalContext } from '../../../../PortalContext';
import { getTelemetryInfo } from '../../../../utils/TelemetryUtils';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterCodeFormData, DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';

const DeploymentCenterDevOpsKuduBuildConfiguredView: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const [repoUrl, setRepoUrl] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [isSourceControlLoading, setIsSourceControlLoading] = useState(true);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);

  const deploymentCenterData = new DeploymentCenterData();

  const fetchSourceControlDetails = async () => {
    const sourceControlDetailsResponse = await deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);
    if (sourceControlDetailsResponse.metadata.success) {
      setRepoUrl(sourceControlDetailsResponse.data.properties.repoUrl);
      setBranch(sourceControlDetailsResponse.data.properties.branch);
    } else {
      setRepoUrl(t('deploymentCenterErrorFetchingInfo'));
      setBranch(t('deploymentCenterErrorFetchingInfo'));
      portalContext.log(
        getTelemetryInfo('error', 'deploymentCenterSourceControls', 'failed', {
          error: sourceControlDetailsResponse.metadata.error,
          message: 'Failed to get source control details',
        })
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
