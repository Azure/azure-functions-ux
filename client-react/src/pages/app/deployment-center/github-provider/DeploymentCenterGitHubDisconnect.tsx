import React, { useContext, useState, useEffect } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { useTranslation } from 'react-i18next';
import { choiceGroupSubLabel, disconnectLink, disconnectWorkflowInfoStyle } from '../DeploymentCenter.styles';
import { Link, Icon, PanelType, ChoiceGroup, ProgressIndicator } from '@fluentui/react';
import {
  DeploymentCenterGitHubDisconnectProps,
  DeploymentDisconnectStatus,
  DeployDisconnectStep,
  WorkflowFileDeleteOptions,
  WorkflowChoiceGroupOption,
} from '../DeploymentCenter.types';
import {
  getWorkflowFileName,
  getWorkflowFilePath,
  getSourceControlsWorkflowFilePath,
  getSourceControlsWorkflowFileName,
  getTelemetryInfo,
} from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import ActionBar from '../../../../components/ActionBar';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { SiteStateContext } from '../../../../SiteState';
import { clearGitHubActionSourceControlPropertiesManually } from '../utility/GitHubActionUtility';

const DeploymentCenterGitHubDisconnect: React.FC<DeploymentCenterGitHubDisconnectProps> = props => {
  const { branch, org, repo, repoUrl, formProps } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);
  const deploymentCenterData = new DeploymentCenterData();

  const workflowFile = getWorkflowFileName(
    branch,
    deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
    deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.slot : ''
  );
  const workflowPath = getWorkflowFilePath(
    branch,
    deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
    deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.slot : ''
  );

  const [isDisconnectPanelOpen, setIsDisconnectPanelOpen] = useState<boolean>(false);
  const [selectedWorkflowOption, setSelectedWorkflowOption] = useState<WorkflowFileDeleteOptions>(WorkflowFileDeleteOptions.Preserve);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [workflowConfigExists, setWorkflowConfigExists] = useState<boolean>(false);
  const [workflowFileName, setWorkflowFileName] = useState<string>(workflowFile);
  const [workflowFilePath, setWorkflowFilePath] = useState<string>(workflowPath);

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
    dismissDisconnectPanel();

    portalContext.log(
      getTelemetryInfo('info', 'gitHubDisconnect', 'submit', {
        deleteWorkflowDuringDisconnect: deleteWorkflowDuringDisconnect ? 'true' : 'false',
      })
    );

    const deleteSourceControlStatus = await deleteSourceControl(deleteWorkflowDuringDisconnect);

    if (deleteSourceControlStatus.isSuccessful) {
      formProps.resetForm();
      portalContext.stopNotification(notificationId, true, t('disconnectingDeploymentSuccess'));
      await deploymentCenterContext.refresh();
    } else {
      portalContext.stopNotification(
        notificationId,
        false,
        deleteSourceControlStatus.errorMessage ? deleteSourceControlStatus.errorMessage : t('disconnectingDeploymentFail')
      );
    }
  };

  // NOTE(michinoy): Eventually the deletion of workflow file will move entirely to the backend API.
  // As we are transitioning from having all the logic in the UX to the API, we are passing in the 'deleteWorkflowDuringDisconnect' flag.
  // This will make sure we are deleting the workflow from the UX only for now.
  const deleteSourceControl = async (deleteWorkflowDuringDisconnect: boolean) => {
    return siteStateContext.isKubeApp
      ? clearMetadataAndConfig(deleteWorkflowDuringDisconnect)
      : deleteSourceControlDetails(deleteWorkflowDuringDisconnect);
  };

  const clearMetadataAndConfig = async (deleteWorkflowDuringDisconnect: boolean) => {
    const deleteWorkflowFileStatus = await deleteWorkflowFileManually(deleteWorkflowDuringDisconnect);
    if (deleteWorkflowFileStatus.isSuccessful) {
      portalContext.log(getTelemetryInfo('info', 'clearMetadataAndConfig', 'submit'));

      const response = await clearGitHubActionSourceControlPropertiesManually(
        deploymentCenterData,
        deploymentCenterContext.resourceId,
        portalContext
      );

      if (!response.metadata.success) {
        portalContext.log(
          getTelemetryInfo('error', 'clearMetadataAndConfig', 'failed', {
            message: getErrorMessage(response.metadata.error),
            errorAsString: JSON.stringify(response.metadata.error),
          })
        );

        const failedStatus: DeploymentDisconnectStatus = {
          step: DeployDisconnectStep.ClearSCMSettings,
          isSuccessful: false,
          error: response.metadata.error,
        };

        const errorMessage = getErrorMessage(response.metadata.error);

        if (errorMessage) {
          failedStatus.errorMessage = deleteWorkflowDuringDisconnect
            ? t('disconnectingDeploymentFailWorkflowFileDeleteSucceededWithMessage').format(errorMessage)
            : t('disconnectingDeploymentFailWithMessage').format(errorMessage);
        } else {
          failedStatus.errorMessage = deleteWorkflowDuringDisconnect
            ? t('disconnectingDeploymentFailWorkflowFileDeleteSucceeded')
            : t('disconnectingDeploymentFail');
        }

        return failedStatus;
      } else {
        const successStatus: DeploymentDisconnectStatus = {
          step: DeployDisconnectStep.ClearSCMSettings,
          isSuccessful: true,
        };
        return successStatus;
      }
    } else {
      return deleteWorkflowFileStatus;
    }
  };

  const deleteSourceControlDetails = async (deleteWorkflowDuringDisconnect: boolean) => {
    portalContext.log(getTelemetryInfo('info', 'deleteSourceControlDetails', 'submit'));

    const deleteSourceControlDetailsResponse = await deploymentCenterData.deleteSourceControlDetails(
      deploymentCenterContext.resourceId,
      deleteWorkflowDuringDisconnect
    );

    if (!deleteSourceControlDetailsResponse.metadata.success) {
      portalContext.log(
        getTelemetryInfo('error', 'deleteSourceControlDetailsResponse', 'failed', {
          message: getErrorMessage(deleteSourceControlDetailsResponse.metadata.error),
          errorAsString: JSON.stringify(deleteSourceControlDetailsResponse.metadata.error),
        })
      );

      const failedStatus: DeploymentDisconnectStatus = {
        step: DeployDisconnectStep.ClearSCMSettings,
        isSuccessful: false,
        error: deleteSourceControlDetailsResponse.metadata.error,
      };

      const errorMessage = getErrorMessage(deleteSourceControlDetailsResponse.metadata.error);

      if (errorMessage) {
        failedStatus.errorMessage = deleteWorkflowDuringDisconnect
          ? t('disconnectingDeploymentFailWorkflowFileDeleteSucceededWithMessage').format(errorMessage)
          : t('disconnectingDeploymentFailWithMessage').format(errorMessage);
      } else {
        failedStatus.errorMessage = deleteWorkflowDuringDisconnect
          ? t('disconnectingDeploymentFailWorkflowFileDeleteSucceeded')
          : t('disconnectingDeploymentFail');
      }

      return failedStatus;
    } else {
      const successStatus: DeploymentDisconnectStatus = {
        step: DeployDisconnectStep.ClearSCMSettings,
        isSuccessful: true,
      };
      return successStatus;
    }
  };

  const deleteWorkflowFileManually = async (deleteWorkflowDuringDisconnect: boolean) => {
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
        deploymentCenterContext.gitHubToken
      );

      if (workflowConfigurationResponse.metadata.success) {
        portalContext.log(
          getTelemetryInfo('error', 'deleteActionWorkflow', 'submit', {
            org,
            repo,
            branch,
            workflowFilePath,
          })
        );

        const deleteWorkflowFileResponse = await deploymentCenterData.deleteActionWorkflow(
          deploymentCenterContext.gitHubToken,
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
            portalContext.log(
              getTelemetryInfo('error', 'deleteSourceControlDetailsResponse', 'failed', {
                errorAsString: JSON.stringify(deleteWorkflowFileResponse.metadata.error),
              })
            );
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

    //(Note stpelleg): Apps deployed to production slot can have siteDescriptor.slot of undefined
    const isProductionSlot =
      deploymentCenterContext.siteDescriptor &&
      (!deploymentCenterContext.siteDescriptor.slot || deploymentCenterContext.siteDescriptor.slot.toLocaleLowerCase() === 'production');
    if (isProductionSlot) {
      await fetchAppAndSourceControlsWorkflowConfiguration();
    } else {
      await fetchAppOnlyWorkflowConfiguration();
    }

    setIsLoading(false);
  };

  const fetchAppOnlyWorkflowConfiguration = async () => {
    const appWorkflowConfigurationResponse = await deploymentCenterData.getWorkflowConfiguration(
      org,
      repo,
      branch,
      workflowFilePath,
      deploymentCenterContext.gitHubToken
    );

    setWorkflowConfigExists(appWorkflowConfigurationResponse.metadata.success);
  };

  //(Note stpelleg): Apps deployed to production using the source controls API have a different workflow file name
  // format than ones deployed through the deployment center, so we need two checks for the workflow file.
  const fetchAppAndSourceControlsWorkflowConfiguration = async () => {
    const sourceControlsWorkflowFilePath = getSourceControlsWorkflowFilePath(
      branch,
      deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
      'production'
    );

    const [appWorkflowConfigurationResponse, sourceControlsWorkflowConfigurationResponse] = await Promise.all([
      deploymentCenterData.getWorkflowConfiguration(org, repo, branch, workflowFilePath, deploymentCenterContext.gitHubToken),
      deploymentCenterData.getWorkflowConfiguration(org, repo, branch, sourceControlsWorkflowFilePath, deploymentCenterContext.gitHubToken),
    ]);

    if (appWorkflowConfigurationResponse.metadata.success) {
      setWorkflowConfigExists(appWorkflowConfigurationResponse.metadata.success);
    } else if (sourceControlsWorkflowConfigurationResponse.metadata.success) {
      setWorkflowConfigExists(sourceControlsWorkflowConfigurationResponse.metadata.success);
      setWorkflowFilePath(sourceControlsWorkflowFilePath);
      setWorkflowFileName(
        getSourceControlsWorkflowFileName(
          branch,
          deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
          'production'
        )
      );
    } else {
      setWorkflowConfigExists(false);
    }
  };

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
          <div className={choiceGroupSubLabel}>{t('githubActionWorkflowFileDeleteDescription')}</div>
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
          {t('githubActionWorkflowFileDeletePanelDescription')}
          {getWorkflowFileRepoAndBranchContent()}
          <ChoiceGroup selectedKey={selectedWorkflowOption} options={options} onChange={updateSelectedWorkflowChoice} required={true} />
        </>
      );
    } else {
      return <h4>{t('githubActionWorkflowFileDeletePanelNoChoiceDescription').format(workflowFileName, branch, repoUrl)}</h4>;
    }
  };

  const getWorkflowFileRepoAndBranchContent = () => {
    return (
      <div className={disconnectWorkflowInfoStyle}>
        <ReactiveFormControl id="deployment-center-workflow-file-name" label={t('githubActionWorkflowFileLabel')}>
          <div>{workflowFileName}</div>
        </ReactiveFormControl>
        <ReactiveFormControl id="deployment-center-repository" label={t('deploymentCenterOAuthRepository')}>
          <div>{repoUrl}</div>
        </ReactiveFormControl>
        <ReactiveFormControl id="deployment-center-organization" label={t('deploymentCenterOAuthBranch')}>
          <div>{branch}</div>
        </ReactiveFormControl>
      </div>
    );
  };

  useEffect(() => {
    fetchWorkflowConfiguration();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Link key="deployment-center-disconnect-link" onClick={showDisconnectPanel} className={disconnectLink} aria-label={t('disconnect')}>
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
