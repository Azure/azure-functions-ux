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
import { getArmToken, getWorkflowFileName, getWorkflowFilePath } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import ActionBar from '../../../../components/ActionBar';

const DeploymentCenterGitHubDisconnect: React.FC<DeploymentCenterGitHubDisconnectProps> = props => {
  const { branch, org, repo, repoUrl } = props;
  const { t } = useTranslation();
  const [isDisconnectPanelOpen, setIsDisconnectPanelOpen] = useState<boolean>(false);
  const [selectedWorkflowOption, setSelectedWorkflowOption] = useState<WorkflowFileDeleteOptions>(WorkflowFileDeleteOptions.Preserve);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [workflowConfigExists, setWorkflowConfigExists] = useState<boolean>(false);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);
  const deploymentCenterData = new DeploymentCenterData();

  const workflowFileName = getWorkflowFileName(
    branch,
    deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
    deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.slot : ''
  );

  const workflowFilePath = getWorkflowFilePath(
    branch,
    deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
    deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.slot : ''
  );

  const showDisconnectPanel = () => {
    setSelectedWorkflowOption(WorkflowFileDeleteOptions.Preserve);
    setIsDisconnectPanelOpen(true);
  };

  const dismissDisconnectPanel = () => {
    setIsDisconnectPanelOpen(false);
  };

  const updateSelectedWorkflowChoice = (e: any, option: WorkflowChoiceGroupOption) => {
    setSelectedWorkflowOption(option.workflowDeleteChoice);
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

  const clearSCMSettings = async (deleteWorkflowDuringDisconnect: boolean, deploymentDisconnectStatus: DeploymentDisconnectStatus) => {
    if (deploymentDisconnectStatus.isSuccessful) {
      const deleteSourceControlDetailsResponse = await deploymentCenterData.deleteSourceControlDetails(deploymentCenterContext.resourceId);
      if (!deleteSourceControlDetailsResponse.metadata.success) {
        const failedStatus: DeploymentDisconnectStatus = {
          step: DeployDisconnectStep.ClearSCMSettings,
          isSuccessful: false,
          error: deleteSourceControlDetailsResponse.metadata.error,
        };

        failedStatus.errorMessage = deleteWorkflowDuringDisconnect
          ? t('disconnectingDeploymentFailWorkflowFileDeleteSucceeded')
          : t('disconnectingDeploymentFail');
        return failedStatus;
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
    const errorMessage = t('githubActionDisconnectWorkflowDeleteFailed').format(workflowFileName, branch, repoUrl);

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
      const workflowConfigurationResponse = await deploymentCenterData.getWorkflowConfiguration(
        org,
        repo,
        branch,
        workflowFilePath,
        getArmToken()
      );

      if (workflowConfigurationResponse.metadata.success) {
        const deleteWorkflowFileResponse = await deploymentCenterData.deleteActionWorkflow(
          getArmToken(),
          org,
          repo,
          branch,
          workflowFilePath,
          t('githubActionWorkflowDeleteCommitMessage'),
          workflowConfigurationResponse.data.sha
        );
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

  const fetchWorkflowConfiguration = async () => {
    setIsLoading(true);

    const appWorkflowConfigurationResponse = await deploymentCenterData.getWorkflowConfiguration(
      org,
      repo,
      branch,
      workflowFilePath,
      getArmToken()
    );

    setWorkflowConfigExists(appWorkflowConfigurationResponse.metadata.success);
    setIsLoading(false);
  };

  const options: WorkflowChoiceGroupOption[] = [
    {
      key: 'Preserve',
      text: t('githubActionWorkflowFilePreserveLabel'),
      workflowDeleteChoice: WorkflowFileDeleteOptions.Preserve,
      onRenderField: (fieldProps, defaultRenderer) => (
        <div>
          {defaultRenderer!(fieldProps)}
          <div className={choiceGroupSubLabel}>
            {t('githubActionWorkflowFilePreserveDescription').format(workflowFileName, branch, repoUrl)}
          </div>
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
    onClick: () => disconnectCallback(selectedWorkflowOption === WorkflowFileDeleteOptions.Delete),
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

  const getPanelContent = () => {
    if (workflowConfigExists) {
      return (
        <>
          <h4>{t('githubActionWorkflowFileDeletePanelDescription')}</h4>
          <h4>{t('githubActionWorkflowFileDeletePanelChoiceDescription')}</h4>
          <ChoiceGroup
            selectedKey={selectedWorkflowOption}
            options={options}
            onChange={updateSelectedWorkflowChoice}
            label={t('githubActionWorkflowFileLabel')}
            required={true}
          />
        </>
      );
    } else {
      return <h4>{t('githubActionWorkflowFileDeletePanelNoChoiceDescription').format(workflowFileName, branch, repoUrl)}</h4>;
    }
  };

  useEffect(() => {
    fetchWorkflowConfiguration();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {isLoading ? getProgressIndicator() : getPanelContent()}
        <ActionBar
          id="app-settings-edit-footer"
          primaryButton={actionBarPrimaryButtonProps}
          secondaryButton={actionBarSecondaryButtonProps}
        />
      </CustomPanel>
    </>
  );
};

export default DeploymentCenterGitHubDisconnect;
