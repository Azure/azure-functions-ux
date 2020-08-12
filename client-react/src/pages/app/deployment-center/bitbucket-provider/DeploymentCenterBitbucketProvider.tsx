import React, { useState } from 'react';
import { DeploymentCenterBitbucketProviderProps } from '../DeploymentCenter.types';
import DeploymentCenterBitbucketAccount from './DeploymentCenterBitbucketAccount';
import { Field } from 'formik';
import { IDropdownOption, Dropdown } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';

const DeploymentCenterBitbucketProvider: React.FC<DeploymentCenterBitbucketProviderProps> = props => {
  const { formProps, fetchRepositoriesInOrganization, fetchBranchOptions, organizationOptions, repositoryOptions, branchOptions } = props;

  const { t } = useTranslation();

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

    fetchRepositoriesInOrganization(option.key.toString());
  };

  const onRepositoryChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedRepo(option.text);
    formProps.setFieldValue('repo', option.key.toString());

    setSelectedBranch('');
    formProps.setFieldValue('branch', '');

    fetchBranchOptions(formProps.values.org, option.key.toString());
  };

  const onBranchChange = async (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedBranch(option.text);
    formProps.setFieldValue('branch', option.key.toString());
  };

  return (
    <>
      <DeploymentCenterBitbucketAccount {...props} />

      {props.accountUser && (
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

export default DeploymentCenterBitbucketProvider;
