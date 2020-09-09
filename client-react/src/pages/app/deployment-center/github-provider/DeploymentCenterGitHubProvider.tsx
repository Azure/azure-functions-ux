import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DeploymentCenterGitHubAccount from './DeploymentCenterGitHubAccount';
import { DeploymentCenterGitHubProviderProps } from '../DeploymentCenter.types';
import Dropdown from '../../../../components/form-controls/DropDown';
import { Field } from 'formik';
import { SiteStateContext } from '../../../../SiteState';

const DeploymentCenterGitHubProvider: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const { t } = useTranslation();
  const siteStateContext = useContext(SiteStateContext);

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

  return (
    <>
      <h3>{siteStateContext.isContainerApp ? t('deploymentCenterContainerGitHubActionsTitle') : t('deploymentCenterCodeGitHubTitle')}</h3>

      <DeploymentCenterGitHubAccount {...props} />

      {accountUser && accountUser.login && (
        <>
          <Field
            id="deployment-center-settings-organization-option"
            label={t('deploymentCenterOAuthOrganization')}
            placeholder={t('deploymentCenterOAuthOrganizationPlaceholder')}
            name="org"
            defaultSelectedKey={formProps.values.org}
            component={Dropdown}
            displayInVerticalLayout={true}
            options={organizationOptions}
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

export default DeploymentCenterGitHubProvider;
