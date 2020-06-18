import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowOption, DeploymentCenterFieldProps, WorkflowDropdownOption } from '../DeploymentCenter.types';
import { IDropdownOption, MessageBarType, ProgressIndicator } from 'office-ui-fabric-react';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import Dropdown from '../../../../components/form-controls/DropDown';
import { Field } from 'formik';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { getArmToken } from '../utility/DeploymentCenterUtility';

const DeploymentCenterGitHubWorkflowConfig: React.FC<DeploymentCenterFieldProps> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const [showWorkflowConfigDropdown, setShowWorkflowConfigDropdown] = useState<boolean>(false);
  const [workflowConfigDropwdownOptions, setWorkflowConfigDropwdownOptions] = useState<IDropdownOption[] | undefined>(undefined);
  const [workflowFileExistsWarningMessage, setWorkflowFileExistsWarningMessage] = useState<string>('');
  const [selectedWorkflowConfigOption, setSelectedWorkflowConfigOption] = useState<WorkflowOption | undefined>(undefined);

  const overwriteOrUseExistingOptions: WorkflowDropdownOption[] = [
    {
      key: WorkflowOption.Overwrite,
      text: t('deploymentCenterSettingsGitHubActionWorkflowOptionOverwrite'),
      workflowOption: WorkflowOption.Overwrite,
    },
    {
      key: WorkflowOption.UseExistingWorkflowConfig,
      text: t('deploymentCenterSettingsGitHubActionWorkflowOptionUseExisting'),
      workflowOption: WorkflowOption.UseExistingWorkflowConfig,
    },
  ];
  const addOrUseExistingOptions: WorkflowDropdownOption[] = [
    { key: WorkflowOption.Add, text: t('deploymentCenterSettingsGitHubActionWorkflowOptionAdd'), workflowOption: WorkflowOption.Add },
    {
      key: WorkflowOption.UseAvailableWorkflowConfigs,
      text: t('deploymentCenterSettingsGitHubActionWorkflowOptionUseExisting'),
      workflowOption: WorkflowOption.UseAvailableWorkflowConfigs,
    },
  ];

  const getWorkflowFileName = (branch: string, siteName: string, slotName?: string): string => {
    const normalizedBranchName = branch.split('/').join('-');
    return slotName ? `${normalizedBranchName}_${siteName}(${slotName}).yml` : `${normalizedBranchName}_${siteName}.yml`;
  };

  const onWorkflowOptionChange = (event: React.FormEvent<HTMLDivElement>, option: WorkflowDropdownOption) => {
    setSelectedWorkflowConfigOption(option.workflowOption);
    if (formProps) {
      formProps.setFieldValue('workflowOption', option.workflowOption);
    }
  };

  const fetchWorkflowConfiguration = async (selectedOrg: string, selectedRepo: string, selectedBranch: string) => {
    setSelectedWorkflowConfigOption(WorkflowOption.Loading);
    if (formProps) {
      formProps.setFieldValue('workflowOption', WorkflowOption.Loading);
    }

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

    setSelectedWorkflowConfigOption(WorkflowOption.None);
    if (formProps) {
      formProps.setFieldValue('workflowOption', WorkflowOption.None);
    }
  };

  useEffect(
    () => {
      setShowWorkflowConfigDropdown(false);
      setSelectedWorkflowConfigOption(WorkflowOption.None);
      if (formProps) {
        formProps.setFieldValue('workflowOption', WorkflowOption.None);
      }
      if (formProps && formProps.values.branch !== '') {
        fetchWorkflowConfiguration(formProps.values.org, formProps.values.repo, formProps.values.branch);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    formProps ? [formProps.values.branch] : []
  );

  return (
    <>
      {selectedWorkflowConfigOption === WorkflowOption.Loading && (
        <ProgressIndicator
          description={t('deploymentCenterWorkflowConfigsLoading')}
          ariaValueText={t('deploymentCenterWorkflowConfigsLoadingAriaValue')}
        />
      )}
      {showWorkflowConfigDropdown && (
        <>
          <h3>{t('deploymentCenterSettingsWorkflowConfigTitle')}</h3>
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
            selectedKey={selectedWorkflowConfigOption}
            required={true}
            onChange={onWorkflowOptionChange}
          />
        </>
      )}
    </>
  );
};

export default DeploymentCenterGitHubWorkflowConfig;
