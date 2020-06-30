import React, { useContext } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { useTranslation } from 'react-i18next';
import { additionalTextFieldControl } from '../DeploymentCenter.styles';
import { Link, Icon } from 'office-ui-fabric-react';
import { DeploymentCenterGitHubDisconnectProps } from '../DeploymentCenter.types';
import { getArmToken, getWorkflowFileName } from '../utility/DeploymentCenterUtility';
import { FileContent, GitHubCommit } from '../../../../models/github';
import { PortalContext } from '../../../../PortalContext';

const DeploymentCenterGitHubDisconnect: React.FC<DeploymentCenterGitHubDisconnectProps> = props => {
  const { branch, org, repo, repoApiUrl, formProps } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);
  const deploymentCenterData = new DeploymentCenterData();

  enum DeployDisconnectStep {
    DeleteWorkflowFile = 'DeleteWorkflowFile',
    ClearSCMSettings = 'ClearSCMSettings',
  }

  interface DeploymentDisconnectStatus {
    step: DeployDisconnectStep;
    isSuccessful: boolean;
    errorMessage?: string;
    error?: any;
  }

  const disconnectCallback = async () => {
    const notificationId = portalContext.startNotification(t('disconnectingDeployment'), t('disconnectingDeployment'));
    if (formProps) {
      formProps.values.deleteWorkflowDuringDisconnect = true;
    }

    let deploymentDisconnectStatus = await deleteWorkflowFileIfNeeded();
    deploymentDisconnectStatus = await clearSCMSettings(deploymentDisconnectStatus);

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

  const clearSCMSettings = async (deploymentDisconnectStatus: DeploymentDisconnectStatus) => {
    if (deploymentDisconnectStatus.isSuccessful) {
      const deleteSourceControlDetailsResponse = await deploymentCenterData.deleteSourceControlDetails(deploymentCenterContext.resourceId);
      if (!deleteSourceControlDetailsResponse.metadata.success) {
        const failedStatus: DeploymentDisconnectStatus = {
          step: DeployDisconnectStep.ClearSCMSettings,
          isSuccessful: false,
          error: deleteSourceControlDetailsResponse.metadata.error,
        };

        if (formProps && formProps.values.deleteWorkflowDuringDisconnect) {
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

  const deleteWorkflowFileIfNeeded = async () => {
    const workflowFileName =
      formProps && deploymentCenterContext.siteDescriptor
        ? getWorkflowFileName(branch, deploymentCenterContext.siteDescriptor.site, deploymentCenterContext.siteDescriptor.slot)
        : '';

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

    if (formProps && !formProps.values.deleteWorkflowDuringDisconnect) {
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

  return (
    <>
      {repoApiUrl && (
        <Link
          key="deployment-center-disconnect-link"
          onClick={disconnectCallback}
          className={additionalTextFieldControl}
          aria-label={t('disconnect')}>
          <Icon iconName={'PlugDisconnected'} />
          {` ${t('disconnect')}`}
        </Link>
      )}
    </>
  );
};

export default DeploymentCenterGitHubDisconnect;
