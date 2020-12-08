import React from 'react';
import { DeploymentCenterBitbucketProviderProps } from '../DeploymentCenter.types';
import DeploymentCenterBitbucketAccount from './DeploymentCenterBitbucketAccount';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import { useTranslation } from 'react-i18next';

const DeploymentCenterBitbucketProvider: React.FC<DeploymentCenterBitbucketProviderProps> = props => {
  const {
    formProps,
    accountUser,
    organizationOptions,
    repositoryOptions,
    branchOptions,
    loadingOrganizations,
    loadingRepositories,
    loadingBranches,
  } = props;

  const { t } = useTranslation();

  return (
    <>
      <h3>{t('deploymentCenterCodeBitbucketTitle')}</h3>

      <DeploymentCenterBitbucketAccount {...props} />

      {accountUser && accountUser.username && (
        <>
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
      )}
    </>
  );
};

export default DeploymentCenterBitbucketProvider;
