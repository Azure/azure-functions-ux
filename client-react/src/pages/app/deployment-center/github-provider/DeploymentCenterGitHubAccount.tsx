import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterGitHubProviderProps } from '../DeploymentCenter.types';
import { PrimaryButton, Label, Link, IDropdownOption, MessageBarType } from 'office-ui-fabric-react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl, deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import Dropdown from '../../../../components/form-controls/DropDown';
import { Field } from 'formik';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';

const DeploymentCenterGitHubAccount: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const {
    formProps,
    gitHubUser,
    gitHubAccountStatusMessage,
    authorizeGitHubAccount,
    fetchRepositoryOptions,
    fetchBranchOptions,
    organizationOptions,
    repositoryOptions,
    branchOptions,
  } = props;
  const { t } = useTranslation();

  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  const closeInfoBanner = () => {
    setShowInfoBanner(false);
  };

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

  const gitHubAccountControls = gitHubUser ? (
    <>
      {showInfoBanner && (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner
            message={t('deploymentCenterConfigureGitHubPermissions')}
            type={MessageBarType.info}
            learnMoreLink={DeploymentCenterLinks.configureDeployment}
            onDismiss={closeInfoBanner}
          />
        </div>
      )}

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
  ) : (
    <PrimaryButton ariaDescription={t('deploymentCenterOAuthAuthorizeAriaLabel')} onClick={authorizeGitHubAccount}>
      {t('deploymentCenterOAuthAuthorize')}
    </PrimaryButton>
  );

  const gitHubAccountStatusMessageControl = <Label>{gitHubAccountStatusMessage}</Label>;

  return <>{gitHubAccountStatusMessage ? gitHubAccountStatusMessageControl : gitHubAccountControls}</>;
};

export default DeploymentCenterGitHubAccount;
