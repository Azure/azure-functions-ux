import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';

import { MessageBarType } from '@fluentui/react';

import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import Dropdown from '../../../../components/form-controls/DropDown';
import { ScmType } from '../../../../models/site/config';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import { DeploymentCenterDevOpsProviderProps } from '../DeploymentCenter.types';
import { getDescriptionSection } from '../utility/DeploymentCenterUtility';

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

      {getDescriptionSection(ScmType.Vso, t('deploymentCenterAzureReposDescriptionText'))}

      {showInfoBanner && errorMessage && (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner id="devops-error-message" message={errorMessage} type={MessageBarType.error} onDismiss={closeInfoBanner} />
        </div>
      )}

      <Field
        label={t('deploymentCenterOAuthOrganization')}
        placeholder={t('deploymentCenterOAuthOrganizationPlaceholder')}
        name="org"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={organizationOptions}
        defaultSelectedKey={formProps.values.org}
        required={true}
        isLoading={loadingOrganizations}
        aria-required={true}
      />
      <Field
        label={t('deploymentCenterProject')}
        placeholder={t('deploymentCenterProjectPlaceholder')}
        name="devOpsProjectName"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={projectOptions}
        defaultSelectedKey={formProps.values.devOpsProjectName}
        required={true}
        isLoading={loadingProjects}
        aria-required={true}
      />
      <Field
        label={t('deploymentCenterOAuthRepository')}
        placeholder={t('deploymentCenterOAuthRepositoryPlaceholder')}
        name="repo"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={repositoryOptions}
        defaultSelectedKey={formProps.values.repo}
        required={true}
        isLoading={loadingRepositories}
        aria-required={true}
      />
      <Field
        label={t('deploymentCenterOAuthBranch')}
        placeholder={t('deploymentCenterOAuthBranchPlaceholder')}
        name="branch"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={branchOptions}
        defaultSelectedKey={formProps.values.branch}
        required={true}
        isLoading={loadingBranches}
        aria-required={true}
      />
    </>
  );
};

export default DeploymentCenterDevOpsProvider;
