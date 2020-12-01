import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterDevOpsProviderProps } from '../DeploymentCenter.types';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { MessageBarType } from 'office-ui-fabric-react';

const DeploymentCenterDevOpsProvider: React.FC<DeploymentCenterDevOpsProviderProps> = props => {
  const {
    formProps,
    organizationOptions,
    projectOptions,
    repositoryOptions,
    branchOptions,
    loadingOrganizations,
    loadingProjects,
    loadingRepositories,
    loadingBranches,
    errorMessage,
  } = props;

  const { t } = useTranslation();
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const closeInfoBanner = () => {
    setShowInfoBanner(false);
  };

  return (
    <>
      <h3>{t('deploymentCenterCodeDevOpsTitle')}</h3>

      {showInfoBanner && errorMessage && (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner message={errorMessage} type={MessageBarType.error} onDismiss={closeInfoBanner} />
        </div>
      )}

      <Field
        id="deployment-center-settings-organization-option"
        label={t('deploymentCenterOAuthOrganization')}
        placeholder={t('deploymentCenterOAuthOrganizationPlaceholder')}
        name="org"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={organizationOptions}
        defaultSelectedKey={formProps.values.org}
        required={true}
        isLoading={loadingOrganizations}
      />
      <Field
        id="deployment-center-settings-project-option"
        label={t('deploymentCenterProject')}
        placeholder={t('deploymentCenterProjectPlaceholder')}
        name="devOpsProject"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={projectOptions}
        defaultSelectedKey={formProps.values.devOpsProjectName}
        required={true}
        isLoading={loadingProjects}
      />
      <Field
        id="deployment-center-settings-repository-option"
        label={t('deploymentCenterOAuthRepository')}
        placeholder={t('deploymentCenterOAuthRepositoryPlaceholder')}
        name="repo"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={repositoryOptions}
        defaultSelectedKey={formProps.values.repo}
        required={true}
        isLoading={loadingRepositories}
      />
      <Field
        id="deployment-center-settings-branch-option"
        label={t('deploymentCenterOAuthBranch')}
        placeholder={t('deploymentCenterOAuthBranchPlaceholder')}
        name="branch"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={branchOptions}
        defaultSelectedKey={formProps.values.branch}
        required={true}
        isLoading={loadingBranches}
      />
    </>
  );
};

export default DeploymentCenterDevOpsProvider;
