import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterGitHubProviderProps } from '../DeploymentCenter.types';
import { PrimaryButton, Label, Link, IDropdownOption } from 'office-ui-fabric-react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl } from '../DeploymentCenter.styles';
import Dropdown from '../../../../components/form-controls/DropDown';
import { Field } from 'formik';
import DeploymentCenterData from '../DeploymentCenter.data';

const DeploymentCenterGitHubAccount: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const { gitHubUser, gitHubAccountStatusMessage, authorizeGitHubAccount } = props;
  const deploymentCenterData = new DeploymentCenterData();
  const { t } = useTranslation();

  const [organizationOptions, setOrganizationOptions] = useState<IDropdownOption[]>([]);
  const [repositoryOptions, setRepositoryOptions] = useState<IDropdownOption[]>([]);
  const [branchOptions, setBranchOptions] = useState<IDropdownOption[]>([]);

  const fetchOrganizationOptions = async () => {
    const newOrganizationOptions: IDropdownOption[] = [];

    const armToken = window.appsvc && window.appsvc.env.armToken ? `bearer ${window.appsvc.env.armToken}` : '';
    if (gitHubUser) {
      const gitHubOrganizationsResponse = await deploymentCenterData.getGitHubOrganizations(armToken);

      gitHubOrganizationsResponse.data.forEach(org => {
        newOrganizationOptions.push({ key: org.url, text: org.login });
      });

      newOrganizationOptions.push({ key: gitHubUser.repos_url, text: gitHubUser.login });
    }

    setOrganizationOptions(newOrganizationOptions);
  };

  const fetchRepositoryOptions = async (repositories_url: string) => {
    const newRepositoryOptions: IDropdownOption[] = [];

    const armToken = window.appsvc && window.appsvc.env.armToken ? `bearer ${window.appsvc.env.armToken}` : '';

    const gitHubRepositoriesResponse = await (repositories_url.toLocaleLowerCase().indexOf('github.com/users/') > -1
      ? deploymentCenterData.getGitHubUserRepositories(armToken)
      : deploymentCenterData.getGitHubOrgRepositories(repositories_url, armToken));

    gitHubRepositoriesResponse.data.forEach(repository => {
      newRepositoryOptions.push({ key: repository.url, text: repository.name });
    });

    setRepositoryOptions(newRepositoryOptions);
  };

  const fetchBatchOptions = async (repository_url: string) => {
    const newBranchOptions: IDropdownOption[] = [];

    const armToken = window.appsvc && window.appsvc.env.armToken ? `bearer ${window.appsvc.env.armToken}` : '';

    const gitHubBranchesResponse = await deploymentCenterData.getGitHubBranches(repository_url, armToken);

    gitHubBranchesResponse.data.forEach(branch => {
      newBranchOptions.push({ key: branch.name, text: branch.name });
    });

    setBranchOptions(newBranchOptions);
  };

  const onOrganizationChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setBranchOptions([]);
    setRepositoryOptions([]);
    fetchRepositoryOptions(option.key.toString());
  };

  const onRepositoryChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setBranchOptions([]);
    fetchBatchOptions(option.key.toString());
  };

  const onBranchChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {};

  useEffect(() => {
    fetchOrganizationOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitHubUser]);

  const gitHubAccountControls = gitHubUser ? (
    <>
      <ReactiveFormControl id="deployment-center-github-user" label={t('deploymentCenterOAuthSingedInAs')}>
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
      </ReactiveFormControl>
      <Field
        id="deployment-center-settings-organization-option"
        label={t('deploymentCenterOAuthOrganization')}
        placeholder={t('deploymentCenterOAuthOrganizationPlaceholder')}
        name="organization"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={organizationOptions}
        required={true}
        onChange={onOrganizationChange}
      />
      <Field
        id="deployment-center-settings-repository-option"
        label={t('deploymentCenterOAuthRepository')}
        placeholder={t('deploymentCenterOAuthRepositoryPlaceholder')}
        name="repository"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={repositoryOptions}
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
        required={true}
        onChange={onBranchChange}
      />
    </>
  ) : (
    <PrimaryButton ariaDescription={t('deploymentCenterOAuthAuthorizeAriaLabel')} onClick={authorizeGitHubAccount}>
      {t('deploymentCenterOAuthAuthorize')}
    </PrimaryButton>
  );

  const gitHubAccountStatusMessageControl = <Label>{gitHubAccountStatusMessage}</Label>;

  return <>{gitHubAccountStatusMessage ? gitHubAccountStatusMessageControl : gitHubAccountControls}</>;
};

export default DeploymentCenterGitHubAccount;
