import React, { useContext, useState, useEffect } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { useTranslation } from 'react-i18next';
import { additionalTextFieldControl, choiceGroupSubLabel } from '../DeploymentCenter.styles';
import { Link, Icon, PanelType, ChoiceGroup, ProgressIndicator } from 'office-ui-fabric-react';
import {
  DeploymentCenterGitHubDisconnectProps,
  DeploymentDisconnectStatus,
  DeployDisconnectStep,
  WorkflowFileDeleteOptions,
  WorkflowChoiceGroupOption,
} from '../DeploymentCenter.types';
import { getArmToken, getWorkflowFileName } from '../utility/DeploymentCenterUtility';
import { FileContent, GitHubCommit } from '../../../../models/github';
import { PortalContext } from '../../../../PortalContext';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import ActionBar from '../../../../components/ActionBar';

const DeploymentCenterGitHubDisconnect: React.FC<DeploymentCenterGitHubDisconnectProps> = props => {
  const { branch, org, repo, repoUrl, repoApiUrl, formProps } = props;
  const { t } = useTranslation();
  const [isDisconnectPanelOpen, setIsDisconnectPanelOpen] = useState<boolean>(false);
  const [selectedWorkflowChoice, setSelectedWorkflowChoice] = useState<WorkflowFileDeleteOptions>(WorkflowFileDeleteOptions.Preserve);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);
  const deploymentCenterData = new DeploymentCenterData();

  const showDisconnectPanel = () => {
    setSelectedWorkflowChoice(WorkflowFileDeleteOptions.Preserve);
    setIsDisconnectPanelOpen(true);
  };

  const dismissDisconnectPanel = () => {
    setIsDisconnectPanelOpen(false);
  };

  const updateSelectedWorkflowChoice = (e: any, option: WorkflowChoiceGroupOption) => {
    setSelectedWorkflowChoice(option.workflowDeleteChoice);
  };

  const disconnectCallback = async (deleteWorkflowDuringDisconnect: boolean) => {
    const notificationId = portalContext.startNotification(t('disconnectingDeployment'), t('disconnectingDeployment'));

    let deploymentDisconnectStatus = await deleteWorkflowFileIfNeeded(deleteWorkflowDuringDisconnect);
    deploymentDisconnectStatus = await clearSCMSettings(deleteWorkflowDuringDisconnect, deploymentDisconnectStatus);

    if (deploymentDisconnectStatus.isSuccessful) {
      portalContext.stopNotification(notificationId, true, t('disconnectingDeploymentSuccess'));
    } else {
      portalContext.stopNotification(
        notificationId,
        false,
        deploymentDisconnectStatus.errorMessage ? deploymentDisconnectStatus.errorMessage : t('disconnectingDeploymentFail')
      );
    }
  };

  const workflowFileName =
    formProps && deploymentCenterContext.siteDescriptor
      ? getWorkflowFileName(branch, deploymentCenterContext.siteDescriptor.site, deploymentCenterContext.siteDescriptor.slot)
      : '';

  const clearSCMSettings = async (deleteWorkflowDuringDisconnect: boolean, deploymentDisconnectStatus: DeploymentDisconnectStatus) => {
    if (deploymentDisconnectStatus.isSuccessful) {
      const deleteSourceControlDetailsResponse = await deploymentCenterData.deleteSourceControlDetails(deploymentCenterContext.resourceId);
      if (!deleteSourceControlDetailsResponse.metadata.success) {
        const failedStatus: DeploymentDisconnectStatus = {
          step: DeployDisconnectStep.ClearSCMSettings,
          isSuccessful: false,
          error: deleteSourceControlDetailsResponse.metadata.error,
        };

        if (deleteWorkflowDuringDisconnect) {
          failedStatus.errorMessage = t('disconnectingDeploymentFailWorkflowFileDeleteSucceeded');
          return failedStatus;
        } else {
          failedStatus.errorMessage = t('disconnectingDeploymentFail');
          return failedStatus;
        }
      } else {
        const successStatus: DeploymentDisconnectStatus = {
          step: DeployDisconnectStep.ClearSCMSettings,
          isSuccessful: true,
        };
        return successStatus;
      }
    } else {
      return deploymentDisconnectStatus;
    }
  };

  const deleteWorkflowFileIfNeeded = async (deleteWorkflowDuringDisconnect: boolean) => {
    const errorMessage = t('githubActionDisconnectWorkflowDeleteFailed').format(workflowFileName, branch, repoApiUrl);

    const successStatus: DeploymentDisconnectStatus = {
      step: DeployDisconnectStep.DeleteWorkflowFile,
      isSuccessful: true,
    };

    const failedStatus: DeploymentDisconnectStatus = {
      step: DeployDisconnectStep.DeleteWorkflowFile,
      isSuccessful: false,
      errorMessage: errorMessage,
    };

    if (!deleteWorkflowDuringDisconnect) {
      return successStatus;
    } else {
      const workflowFilePath = `.github/workflows/${workflowFileName}`;
      const workflowConfigurationResponse = await deploymentCenterData.getWorkflowConfiguration(
        repoApiUrl,
        branch,
        workflowFilePath,
        getArmToken()
      );

      if (workflowConfigurationResponse.data) {
        const deleteWorkflowFileResponse = await deleteWorkflowFile(workflowFilePath, workflowConfigurationResponse.data);
        if (deleteWorkflowFileResponse && deleteWorkflowFileResponse.metadata.success) {
          return successStatus;
        } else {
          if (deleteWorkflowFileResponse) {
            failedStatus.error = deleteWorkflowFileResponse.metadata.error;
          }
          return failedStatus;
        }
      } else {
        // (Note t-kakan): not localized due to this string not being shown to users
        failedStatus.error = `Workflow file '${workflowFilePath}' not found in branch '${branch}' from repo '${org}/${repo}'`;
        return failedStatus;
      }
    }
  };

  const deleteWorkflowFile = (workflowFilePath: string, fileContent: FileContent) => {
    const deleteCommitInfo: GitHubCommit = {
      repoName: `${org}/${repo}`,
      branchName: branch,
      filePath: workflowFilePath,
      message: t('githubActionWorkflowDeleteCommitMessage'),
      committer: {
        name: 'Azure App Service',
        email: 'donotreply@microsoft.com',
      },
      sha: fileContent.sha,
    };

    return deploymentCenterData.deleteActionWorkflow(getArmToken(), deleteCommitInfo);
  };

  const fetchWorkflowConfiguration = async () => {
    setIsLoading(true);

    if (deploymentCenterContext.siteDescriptor) {
      const workflowFileName = getWorkflowFileName(
        branch,
        deploymentCenterContext.siteDescriptor.site,
        deploymentCenterContext.siteDescriptor.slot
      );
      const workflowFilePath = `.github/workflows/${workflowFileName}`;
      const getAllWorkflowConfigurationsRequest = deploymentCenterData.getAllWorkflowConfigurations(repoApiUrl, branch, getArmToken());
      const getWorkflowConfigurationRequest = deploymentCenterData.getWorkflowConfiguration(
        repoApiUrl,
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
            branchName: selectedBranch,
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
            branchName: selectedBranch,
          })
        );

        setWorkflowConfigDropdownOptions(addOrUseExistingOptions);
        setShowWorkflowConfigDropdown(true);
      } else {
        setSelectedWorkflowConfigOption(WorkflowOption.Add);
        if (formProps) {
          formProps.setFieldValue('workflowOption', WorkflowOption.Add);
        }
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWorkflowConfiguration();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const options: WorkflowChoiceGroupOption[] = [
    {
      key: 'Preserve',
      text: t('githubActionWorkflowFilePreserveLabel'),
      workflowDeleteChoice: WorkflowFileDeleteOptions.Preserve,
      onRenderField: (fieldProps, defaultRenderer) => (
        <div>
          {defaultRenderer!(fieldProps)}
          <div className={choiceGroupSubLabel}>{t('githubActionWorkflowFilePreserveDescription')}</div>
        </div>
      ),
    },
    {
      key: 'Delete',
      text: t('githubActionWorkflowFileDeleteLabel'),
      workflowDeleteChoice: WorkflowFileDeleteOptions.Delete,
      onRenderField: (fieldProps, defaultRenderer) => (
        <div>
          {defaultRenderer!(fieldProps)}
          <div className={choiceGroupSubLabel}>
            {t('githubActionWorkflowFileDeleteDescription').format(workflowFileName, branch, repoUrl)}
          </div>
        </div>
      ),
    },
  ];

  const actionBarPrimaryButtonProps = {
    id: 'save',
    title: t('ok'),
    onClick: () => disconnectCallback(selectedWorkflowChoice === WorkflowFileDeleteOptions.Delete),
    disable: isLoading,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: dismissDisconnectPanel,
    disable: false,
  };

  const getProgressIndicator = () => {
    return (
      <ProgressIndicator
        description={t('deploymentCenterGitHubDisconnectLoading')}
        ariaValueText={t('deploymentCenterGitHubDisconnectLoadingAriaValue')}
      />
    );
  };

  return (
    <>
      <Link
        key="deployment-center-disconnect-link"
        onClick={showDisconnectPanel}
        className={additionalTextFieldControl}
        aria-label={t('disconnect')}>
        <Icon iconName={'PlugDisconnected'} />
        {` ${t('disconnect')}`}
      </Link>
      <CustomPanel
        isOpen={isDisconnectPanelOpen}
        onDismiss={dismissDisconnectPanel}
        type={PanelType.medium}
        headerText={t('githubActionDisconnectConfirmationTitle')}>
        {isLoading ? (
          getProgressIndicator()
        ) : (
          <>
            <h4>{t('githubActionWorkflowFileDeletePanelDescription')}</h4>
            <h4>{t('githubActionWorkflowFileDeletePanelChoiceDescription')}</h4>
            <ChoiceGroup
              selectedKey={selectedWorkflowChoice}
              options={options}
              onChange={updateSelectedWorkflowChoice}
              label={t('githubActionWorkflowFileLabel')}
              required={true}
            />
            <ActionBar
              id="app-settings-edit-footer"
              primaryButton={actionBarPrimaryButtonProps}
              secondaryButton={actionBarSecondaryButtonProps}
            />
          </>
        )}
      </CustomPanel>
    </>
  );
};

export default DeploymentCenterGitHubDisconnect;
