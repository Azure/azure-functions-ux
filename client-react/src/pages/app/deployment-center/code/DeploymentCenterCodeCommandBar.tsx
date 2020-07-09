import React, { useContext } from 'react';
import DeploymentCenterCommandBar from '../DeploymentCenterCommandBar';
import { DeploymentCenterCodeCommandBarProps, WorkflowOption } from '../DeploymentCenter.types';
import { GitHubCommit, GitHubActionWorkflowRequestContent } from '../../../../models/github';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { BuildProvider, ScmType } from '../../../../models/site/config';
import { getWorkflowInformation } from '../utility/GitHubActionUtility';
import { getArmToken } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { Guid } from '../../../../utils/Guid';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';

const DeploymentCenterCodeCommandBar: React.FC<DeploymentCenterCodeCommandBarProps> = props => {
  const { isLoading, showPublishProfilePanel, refresh, formProps } = props;
  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);
  const deploymentCenterData = new DeploymentCenterData();

  class SourceSettings {
    public repoUrl: string;
    public branch: string;
    public isManualIntegration: boolean;
    public isGitHubAction: boolean;
    public isMercurial: boolean;
  }

  const deployKudu = () => {
    // (Note: t-kakan): setting isManualIntegration to false for now. In Angular, it is set to this.wizardValues.sourceProvider === 'external'
    // (Note: t-kakan): setting isMercurial to false for now
    const payload: SourceSettings = {
      repoUrl: `${DeploymentCenterConstants.githubUri}/${formProps.values.org}/${formProps.values.repo}`,
      branch: formProps.values.branch || 'master',
      isManualIntegration: false,
      isGitHubAction: formProps.values.buildProvider === BuildProvider.GitHubAction,
      isMercurial: false,
    };

    if (formProps.values.sourceProvider === ScmType.LocalGit) {
      return deploymentCenterData.updateSourceControlDetailsLocalGit(deploymentCenterContext.resourceId, {
        properties: {
          scmType: 'LocalGit',
        },
      });
    } else {
      return deploymentCenterData.updateSourceControlDetails(deploymentCenterContext.resourceId, { properties: payload });
    }
  };

  const deployGithubActions = async () => {
    const repo = `${formProps.values.org}/${formProps.values.repo}`;
    const branch = formProps.values.branch || 'master';

    const workflowInformation = getWorkflowInformation(
      formProps.values.runtimeStack,
      formProps.values.runtimeVersion,
      formProps.values.runtimeRecommendedVersion,
      branch,
      deploymentCenterContext.isLinuxApplication,
      formProps.values.gitHubPublishProfileSecretGuid,
      deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
      deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.slot : ''
    );

    const commitInfo: GitHubCommit = {
      repoName: repo,
      branchName: branch,
      filePath: `.github/workflows/${workflowInformation.fileName}`,
      message: t('githubActionWorkflowCommitMessage'),
      contentBase64Encoded: btoa(workflowInformation.content),
      committer: {
        name: 'Azure App Service',
        email: 'donotreply@microsoft.com',
      },
    };

    const workflowConfigurationResponse = await deploymentCenterData.getWorkflowConfiguration(
      formProps.values.org,
      formProps.values.repo,
      branch,
      commitInfo.filePath,
      getArmToken()
    );

    if (workflowConfigurationResponse.metadata.success) {
      commitInfo.sha = workflowConfigurationResponse.data.sha;
    }

    const requestContent: GitHubActionWorkflowRequestContent = {
      resourceId: deploymentCenterContext.resourceId,
      secretName: workflowInformation.secretName,
      commit: commitInfo,
    };

    const actionWorkflowResponse = await deploymentCenterData.createOrUpdateActionWorkflow(getArmToken(), requestContent);
    if (actionWorkflowResponse.metadata.success) {
      return deployKudu();
    } else {
      return actionWorkflowResponse;
    }
  };

  const deploy = () => {
    if (formProps.values.buildProvider === BuildProvider.GitHubAction) {
      // NOTE(michinoy): Only initiate writing a workflow configuration file if the branch does not already have it OR
      // the user opted to overwrite it.
      if (formProps.values.workflowOption === WorkflowOption.Overwrite || formProps.values.workflowOption === WorkflowOption.Add) {
        return deployGithubActions();
      } else {
        return deployKudu();
      }
    } else {
      return deployKudu();
    }
  };

  const saveGithubActionsDeploymentSettings = async (saveGuid: string) => {
    const notificationId = portalContext.startNotification(t('settingupDeployment'), t('githubActionSavingSettings'));
    const deployResponse = await deploy();
    if (deployResponse.metadata.success) {
      portalContext.stopNotification(notificationId, true, t('githubActionSettingsSavedSuccessfully'));
    } else {
      const errorMessage = getErrorMessage(deployResponse.metadata.error);
      errorMessage
        ? portalContext.stopNotification(notificationId, false, t('settingupDeploymentFailWithStatusMessage').format(errorMessage))
        : portalContext.stopNotification(notificationId, false, t('settingupDeploymentFail'));
    }
  };

  const saveAppServiceDeploymentSettings = async (saveGuid: string) => {
    const notificationId = portalContext.startNotification(t('settingupDeployment'), t('settingupDeployment'));
    const deployResponse = await deploy();
    if (deployResponse.metadata.success) {
      portalContext.stopNotification(notificationId, true, t('settingupDeploymentSuccess'));
    } else {
      const errorMessage = getErrorMessage(deployResponse.metadata.error);
      errorMessage
        ? portalContext.stopNotification(notificationId, false, t('settingupDeploymentFailWithStatusMessage').format(errorMessage))
        : portalContext.stopNotification(notificationId, false, t('settingupDeploymentFail'));
    }
  };

  const saveFunction = async () => {
    const saveGuid = Guid.newGuid();
    if (formProps.values.buildProvider === BuildProvider.GitHubAction) {
      saveGithubActionsDeploymentSettings(saveGuid);
    } else {
      saveAppServiceDeploymentSettings(saveGuid);
    }
  };

  const discardFunction = () => {
    throw Error('not implemented');
  };

  return (
    <DeploymentCenterCommandBar
      saveFunction={saveFunction}
      discardFunction={discardFunction}
      showPublishProfilePanel={showPublishProfilePanel}
      refresh={refresh}
      isLoading={isLoading}
    />
  );
};

export default DeploymentCenterCodeCommandBar;
