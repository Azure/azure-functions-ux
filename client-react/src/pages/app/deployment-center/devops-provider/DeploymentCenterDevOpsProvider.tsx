import { Field } from 'formik';
import { Dropdown } from 'office-ui-fabric-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterCodeFormData, DeploymentCenterDevOpsProviderProps } from '../DeploymentCenter.types';

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
  } = props;

  const { t } = useTranslation();

  return (
    <>
      <h3>{t('deploymentCenterCodeDevOpsTitle')}</h3>

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
        defaultSelectedKey={formProps.values.devOpsProject}
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
