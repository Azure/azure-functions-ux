import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowOption, WorkflowDropdownOption, DeploymentCenterGitHubWorkflowConfigSelectorProps } from '../DeploymentCenter.types';
import { IDropdownOption, MessageBarType, ProgressIndicator } from 'office-ui-fabric-react';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import Dropdown from '../../../../components/form-controls/DropDown';
import { Field } from 'formik';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { getArmToken, getWorkflowFileName } from '../utility/DeploymentCenterUtility';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';

const DeploymentCenterGitHubWorkflowConfigSelector: React.FC<DeploymentCenterGitHubWorkflowConfigSelectorProps> = props => {
  const { formProps, setGithubActionExistingWorkflowContents } = props;
  const { t } = useTranslation();

  const [selectedWorkflowConfigOption, setSelectedWorkflowConfigOption] = useState<WorkflowOption | undefined>(undefined);
  const [showWorkflowConfigDropdown, setShowWorkflowConfigDropdown] = useState<boolean>(false);
  const [workflowConfigDropdownOptions, setWorkflowConfigDropdownOptions] = useState<IDropdownOption[] | undefined>(undefined);
  const [workflowFileExistsWarningMessage, setWorkflowFileExistsWarningMessage] = useState<string | undefined>(undefined);
  const [isWorkflowConfigLoading, setIsWorkflowConfigLoading] = useState<boolean>(false);

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);

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
      text: t('deploymentCenterSettingsGitHubActionWorkflowOptionUseAvailable'),
      workflowOption: WorkflowOption.UseAvailableWorkflowConfigs,
    },
  ];

  const onWorkflowOptionChange = (event: React.FormEvent<HTMLDivElement>, option: WorkflowDropdownOption) => {
    setSelectedWorkflowConfigOption(option.workflowOption);
    formProps.setFieldValue('workflowOption', option.workflowOption);
  };

  const fetchWorkflowConfiguration = async (org: string, repo: string, branch: string) => {
    setIsWorkflowConfigLoading(true);

    if (deploymentCenterContext.siteDescriptor) {
      const workflowFileName = getWorkflowFileName(
        branch,
        deploymentCenterContext.siteDescriptor.site,
        deploymentCenterContext.siteDescriptor.slot
      );
      const workflowFilePath = `.github/workflows/${workflowFileName}`;
      const getAllWorkflowConfigurationsRequest = deploymentCenterData.getAllWorkflowConfigurations(org, repo, branch, getArmToken());
      const getWorkflowConfigurationRequest = deploymentCenterData.getWorkflowConfiguration(
        org,
        repo,
        branch,
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
            branchName: branch,
          })
        );

        if (appWorkflowConfigurationResponse.data.content) {
          setGithubActionExistingWorkflowContents(atob(appWorkflowConfigurationResponse.data.content));
        } else {
          setGithubActionExistingWorkflowContents('');
        }

        setWorkflowConfigDropdownOptions(overwriteOrUseExistingOptions);
        setShowWorkflowConfigDropdown(true);
      } else if (allWorkflowConfigurationsResponse.metadata.success && allWorkflowConfigurationsResponse.data.length > 0) {
        setWorkflowFileExistsWarningMessage(
          t('githubActionWorkflowsExist', {
            branchName: branch,
          })
        );

        setWorkflowConfigDropdownOptions(addOrUseExistingOptions);
        setShowWorkflowConfigDropdown(true);
      } else {
        setSelectedWorkflowConfigOption(WorkflowOption.Add);
        formProps.setFieldValue('workflowOption', WorkflowOption.Add);
      }
    }
    setIsWorkflowConfigLoading(false);
  };

  useEffect(() => {
    setShowWorkflowConfigDropdown(false);
    setSelectedWorkflowConfigOption(WorkflowOption.None);
    formProps.setFieldValue('workflowOption', WorkflowOption.None);
    if (formProps.values.branch !== '') {
      fetchWorkflowConfiguration(formProps.values.org, formProps.values.repo, formProps.values.branch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.branch]);

  return (
    <>
      {isWorkflowConfigLoading && (
        <ProgressIndicator
          description={t('deploymentCenterWorkflowConfigsLoading')}
          ariaValueText={t('deploymentCenterWorkflowConfigsLoadingAriaValue')}
        />
      )}
      {showWorkflowConfigDropdown && (
        <>
          {workflowFileExistsWarningMessage && (
            <div className={deploymentCenterInfoBannerDiv}>
              <CustomBanner message={workflowFileExistsWarningMessage} type={MessageBarType.warning} />
            </div>
          )}
          <Field
            id="deployment-center-settings-workflow-option"
            label={t('githubActionWorkflowOption')}
            placeholder={t('deploymentCenterSettingsGitHubActionWorkflowOptionPlaceholder')}
            name="workflowOption"
            component={Dropdown}
            displayInVerticalLayout={true}
            options={workflowConfigDropdownOptions}
            selectedKey={selectedWorkflowConfigOption}
            required={true}
            onChange={onWorkflowOptionChange}
          />
        </>
      )}
    </>
  );
};

export default DeploymentCenterGitHubWorkflowConfigSelector;
