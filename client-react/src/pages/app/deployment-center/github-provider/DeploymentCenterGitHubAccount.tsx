import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterGitHubProviderProps } from '../DeploymentCenter.types';
import { PrimaryButton, Label, Link, IDropdownOption } from 'office-ui-fabric-react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl } from '../DeploymentCenter.styles';
import Dropdown from '../../../../components/form-controls/DropDown';
import { Field } from 'formik';

const DeploymentCenterGitHubAccount: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const {
    gitHubUser,
    gitHubAccountStatusMessage,
    authorizeGitHubAccount,
    fetchOrganizationOptions,
    fetchRepositoryOptions,
    fetchBranchOptions: fetchBatchOptions,
    organizationOptions,
    repositoryOptions,
    branchOptions,
  } = props;
  const { t } = useTranslation();

  const onOrganizationChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    fetchRepositoryOptions(option.key.toString());
  };

  const onRepositoryChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
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
