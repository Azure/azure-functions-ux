import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeploymentCenterGitHubAccount from './DeploymentCenterGitHubAccount';
import { DeploymentCenterGitHubProviderProps } from '../DeploymentCenter.types';
import { IDropdownOption } from 'office-ui-fabric-react';
import Dropdown from '../../../../components/form-controls/DropDown';
import { Field } from 'formik';
import { SiteStateContext } from '../../../../SiteState';

const DeploymentCenterGitHubProvider: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const { t } = useTranslation();
  const siteStateContext = useContext(SiteStateContext);

  const {
    formProps,
    accountUser,
    fetchRepositoryOptions,
    fetchBranchOptions,
    organizationOptions,
    repositoryOptions,
    branchOptions,
  } = props;

  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  const onOrganizationChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedOrg(option.key.toString());
    formProps.setFieldValue('org', option.text);

    setSelectedRepo('');
    formProps.setFieldValue('repo', '');

    setSelectedBranch('');
    formProps.setFieldValue('branch', '');

    fetchRepositoryOptions(option.key.toString());
  };

  const onRepositoryChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedRepo(option.text);
    formProps.setFieldValue('repo', option.key.toString());

    setSelectedBranch('');
    formProps.setFieldValue('branch', '');

    fetchBranchOptions(formProps.values.org, option.text);
  };

  const onBranchChange = async (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedBranch(option.text);
    formProps.setFieldValue('branch', option.key.toString());
  };

  return (
    <>
      <h3>
        {siteStateContext.isContainerApplication ? t('deploymentCenterContainerGitHubActionsTitle') : t('deploymentCenterCodeGitHubTitle')}
      </h3>

      <DeploymentCenterGitHubAccount {...props} />

      {accountUser && accountUser.login && (
        <>
          <Field
            id="deployment-center-settings-organization-option"
            label={t('deploymentCenterOAuthOrganization')}
            placeholder={t('deploymentCenterOAuthOrganizationPlaceholder')}
            name="org"
            component={Dropdown}
            displayInVerticalLayout={true}
            options={organizationOptions}
            selectedKey={selectedOrg}
            required={true}
            onChange={onOrganizationChange}
          />
          <Field
            id="deployment-center-settings-repository-option"
            label={t('deploymentCenterOAuthRepository')}
            placeholder={t('deploymentCenterOAuthRepositoryPlaceholder')}
            name="repo"
            component={Dropdown}
            displayInVerticalLayout={true}
            options={repositoryOptions}
            selectedKey={selectedRepo}
            required={true}
            onChange={onRepositoryChange}
          />
          <Field
            id="deployment-center-settings-branch-option"
            label={t('deploymentCenterOAuthBranch')}
            placeholder={t('deploymentCenterOAuthBranchPlaceholder')}
            name="branch"
            component={Dropdown}
            displayInVerticalLayout={true}
            options={branchOptions}
            selectedKey={selectedBranch}
            required={true}
            onChange={onBranchChange}
          />
        </>
      )}
    </>
  );
};

export default DeploymentCenterGitHubProvider;
