import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterGitHubProviderProps, WorkflowOptions } from '../DeploymentCenter.types';
import { PrimaryButton, Label, Link, IDropdownOption, MessageBarType } from 'office-ui-fabric-react';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { additionalTextFieldControl, deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import Dropdown from '../../../../components/form-controls/DropDown';
import { Field } from 'formik';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';

const DeploymentCenterGitHubAccount: React.FC<DeploymentCenterGitHubProviderProps> = props => {
  const {
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

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [showWorkflowConfigDropdown, setShowWorkflowConfigDropdown] = useState<boolean>(false);
  const [workflowConfigDropwdownOptions, setWorkflowConfigDropwdownOptions] = useState<IDropdownOption[] | undefined>(undefined);
  const [workflowFileExistsWarningMessage, setWorkflowFileExistsWarningMessage] = useState<string>('');

  const closeInfoBanner = () => {
    setShowInfoBanner(false);
  };

  const onOrganizationChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedOrg(option.key.toString());
    fetchRepositoryOptions(option.key.toString());
    setSelectedRepo('');
  };

  const onRepositoryChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedRepo(option.key.toString());
    fetchBranchOptions(option.key.toString());
    setSelectedBranch('');
  };

  const getArmToken = () => {
    return window.appsvc && window.appsvc.env.armToken ? `bearer ${window.appsvc.env.armToken}` : '';
  };

  const getWorkflowFileName = (branch: string, siteName: string, slotName?: string): string => {
    const normalizedBranchName = branch.split('/').join('-');
    return slotName ? `${normalizedBranchName}_${siteName}(${slotName}).yml` : `${normalizedBranchName}_${siteName}.yml`;
  };

  const onBranchChange = async (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    setSelectedBranch(option.key.toString());
  };

  const onWorkflowOptionChange = () => {};

  const overwriteOrUseExistingOptions: IDropdownOption[] = [
    { key: WorkflowOptions.Overwrite, text: t('deploymentCenterSettingsGitHubActionWorkflowOptionOverwrite') },
    { key: WorkflowOptions.UseExistingWorkflowConfig, text: t('deploymentCenterSettingsGitHubActionWorkflowOptionUseExisting') },
  ];
  const addOrUseExistingOptions: IDropdownOption[] = [
    { key: WorkflowOptions.Add, text: t('deploymentCenterSettingsGitHubActionWorkflowOptionAdd') },
    { key: WorkflowOptions.UseAvailableWorkflowConfigs, text: t('deploymentCenterSettingsGitHubActionWorkflowOptionUseExisting') },
  ];

  const fetchWorkflowConfiguration = async () => {
    if (deploymentCenterContext.siteDescriptor) {
      const workflowFileName = getWorkflowFileName(
        selectedBranch,
        deploymentCenterContext.siteDescriptor.site,
        deploymentCenterContext.siteDescriptor.slot
      );
      const workflowFilePath = `.github/workflows/${workflowFileName}`;
      const getAllWorkflowConfigurationsRequest = deploymentCenterData.getAllWorkflowConfigurations(
        selectedRepo,
        selectedBranch,
        getArmToken()
      );
      const getWorkflowConfigurationRequest = deploymentCenterData.getWorkflowConfiguration(
        selectedRepo,
        selectedBranch,
        workflowFilePath,
        getArmToken()
      );

      const [allWorkflowConfigurationsResponse, appWorkflowConfigurationResponse] = await Promise.all([
        getAllWorkflowConfigurationsRequest,
        getWorkflowConfigurationRequest,
      ]);

      if (appWorkflowConfigurationResponse.metadata.success) {
        setWorkflowFileExistsWarningMessage(
          t('githubActionWorkflowFileExists', {
            workflowFilePath: workflowFilePath,
            branchName: selectedBranch,
          })
        );

        setWorkflowConfigDropwdownOptions(overwriteOrUseExistingOptions);
        setShowWorkflowConfigDropdown(true);
      } else if (allWorkflowConfigurationsResponse.metadata.success && allWorkflowConfigurationsResponse.data.length > 0) {
        setWorkflowFileExistsWarningMessage(
          t('githubActionWorkflowsExist', {
            branchName: selectedBranch,
          })
        );

        setWorkflowConfigDropwdownOptions(addOrUseExistingOptions);
        setShowWorkflowConfigDropdown(true);
      }
    }
  };

  useEffect(() => {
    setShowWorkflowConfigDropdown(false);
    if (selectedBranch !== '') {
      fetchWorkflowConfiguration();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch]);

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
        name="organization"
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
        name="repository"
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
      {showWorkflowConfigDropdown && (
        <>
          <div className={deploymentCenterInfoBannerDiv}>
            <CustomBanner message={workflowFileExistsWarningMessage} type={MessageBarType.warning} />
          </div>
          <Field
            id="deployment-center-settings-workflow-option"
            label={t('githubActionWorkflowOption')}
            placeholder={t('deploymentCenterSettingsGitHubActionWorkflowOptionPlaceholder')}
            name="workflowOption"
            component={Dropdown}
            displayInVerticalLayout={true}
            options={workflowConfigDropwdownOptions}
            required={true}
            onChange={onWorkflowOptionChange}
          />
        </>
      )}
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
