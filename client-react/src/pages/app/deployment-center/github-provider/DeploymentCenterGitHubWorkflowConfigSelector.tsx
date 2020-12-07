import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowOption, DeploymentCenterGitHubWorkflowConfigSelectorProps } from '../DeploymentCenter.types';
import { IDropdownOption, ProgressIndicator } from 'office-ui-fabric-react';
import { Field } from 'formik';
import { getWorkflowFileName } from '../utility/DeploymentCenterUtility';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import RadioButton from '../../../../components/form-controls/RadioButton';

const DeploymentCenterGitHubWorkflowConfigSelector: React.FC<DeploymentCenterGitHubWorkflowConfigSelectorProps> = props => {
  const { formProps, setGithubActionExistingWorkflowContents } = props;
  const { t } = useTranslation();

  const [showWorkflowConfigRadioButtons, setShowWorkflowConfigRadioButtons] = useState<boolean>(false);
  const [workflowConfigOptions, setWorkflowConfigOptions] = useState<IDropdownOption[] | undefined>(undefined);
  const [isWorkflowConfigLoading, setIsWorkflowConfigLoading] = useState<boolean>(false);

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const getOverwriteOrUseExistingOptions = (workflowFileName: string) => {
    const workflowFileDisplayName = workflowFileName ? `'${workflowFileName}'` : '';
    return [
      {
        key: WorkflowOption.Overwrite,
        text: t('deploymentCenterSettingsGitHubActionWorkflowOptionOverwrite').format(workflowFileDisplayName),
      },
      {
        key: WorkflowOption.UseExistingWorkflowConfig,
        text: t('deploymentCenterSettingsGitHubActionWorkflowOptionUseExisting').format(workflowFileDisplayName),
      },
    ];
  };

  const getAddOrUseExistingOptions = (workflowFileName: string) => {
    const workflowFileDisplayName = workflowFileName ? `'${workflowFileName}'` : '';
    return [
      { key: WorkflowOption.Add, text: t('deploymentCenterSettingsGitHubActionWorkflowOptionAdd').format(workflowFileDisplayName) },
      {
        key: WorkflowOption.UseAvailableWorkflowConfigs,
        text: t('deploymentCenterSettingsGitHubActionWorkflowOptionUseAvailable'),
      },
    ];
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
      const getAllWorkflowConfigurationsRequest = deploymentCenterData.getAllWorkflowConfigurations(
        org,
        repo,
        branch,
        deploymentCenterContext.gitHubToken
      );
      const getWorkflowConfigurationRequest = deploymentCenterData.getWorkflowConfiguration(
        org,
        repo,
        branch,
        workflowFilePath,
        deploymentCenterContext.gitHubToken
      );

      const [allWorkflowConfigurationsResponse, appWorkflowConfigurationResponse] = await Promise.all([
        getAllWorkflowConfigurationsRequest,
        getWorkflowConfigurationRequest,
      ]);

      setGithubActionExistingWorkflowContents('');

      if (appWorkflowConfigurationResponse.metadata.success) {
        if (appWorkflowConfigurationResponse.data.content) {
          setGithubActionExistingWorkflowContents(atob(appWorkflowConfigurationResponse.data.content));
        }
        setWorkflowConfigOptions(getOverwriteOrUseExistingOptions(workflowFileName));
        setShowWorkflowConfigRadioButtons(true);
      } else if (allWorkflowConfigurationsResponse.metadata.success && allWorkflowConfigurationsResponse.data.length > 0) {
        setWorkflowConfigOptions(getAddOrUseExistingOptions(workflowFileName));
        setShowWorkflowConfigRadioButtons(true);
      } else {
        formProps.setFieldValue('workflowOption', WorkflowOption.Add);
      }
    }
    setIsWorkflowConfigLoading(false);
  };

  const setDefaultWorkflowOption = () => {
    if (formProps.values.workflowOption && formProps.values.workflowOption !== WorkflowOption.None) {
      return formProps.values.workflowOption;
    } else if (workflowConfigOptions && workflowConfigOptions.length > 0 && workflowConfigOptions[0].key === WorkflowOption.Overwrite) {
      formProps.setFieldValue('workflowOption', WorkflowOption.Overwrite);
      return WorkflowOption.Overwrite;
    } else {
      formProps.setFieldValue('workflowOption', WorkflowOption.Add);
      return WorkflowOption.Add;
    }
  };

  useEffect(() => {
    setShowWorkflowConfigRadioButtons(false);
    if (formProps.values.org && formProps.values.repo && formProps.values.branch) {
      fetchWorkflowConfiguration(formProps.values.org, formProps.values.repo, formProps.values.branch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.org, formProps.values.repo, formProps.values.branch]);

  return (
    <>
      {isWorkflowConfigLoading && (
        <ProgressIndicator
          description={t('deploymentCenterWorkflowConfigsLoading')}
          ariaValueText={t('deploymentCenterWorkflowConfigsLoadingAriaValue')}
        />
      )}
      {showWorkflowConfigRadioButtons && (
        <Field
          id="deployment-center-settings-workflow-option"
          label={t('githubActionWorkflowOption')}
          placeholder={t('deploymentCenterSettingsGitHubActionWorkflowOptionPlaceholder')}
          name="workflowOption"
          defaultSelectedKey={setDefaultWorkflowOption()}
          component={RadioButton}
          displayInVerticalLayout={true}
          options={workflowConfigOptions}
          required={true}
        />
      )}
    </>
  );
};

export default DeploymentCenterGitHubWorkflowConfigSelector;
