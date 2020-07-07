import React, { useContext } from 'react';
import DeploymentCenterCommandBar from '../DeploymentCenterCommandBar';
import { DeploymentCenterCodeCommandBarProps, WorkflowOption } from '../DeploymentCenter.types';
import { Guid } from '../../../../utils/Guid';
import { BuildProvider, ScmType } from '../../../../models/site/config';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { PortalContext } from '../../../../PortalContext';
import { getWorkflowInformation } from '../utility/GitHubActionUtility';
import { GitHubCommit, GitHubActionWorkflowRequestContent } from '../../../../models/github';
import DeploymentCenterData from '../DeploymentCenter.data';
import { getArmToken } from '../utility/DeploymentCenterUtility';

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
    public deploymentRollbackEnabled: boolean;
    public isMercurial: boolean;
  }

  const deployKudu = () => {
    const payload = this.wizardValues.sourceSettings;

    payload.isGitHubAction = formProps.values.buildProvider === BuildProvider.GitHubAction;
    // (Note: t-kakan): setting isManualIntegration to false for now. In Angular, it is set to this.wizardValues.sourceProvider === 'external'
    payload.isManualIntegration = false;

    if (formProps.values.sourceProvider === ScmType.LocalGit) {
      return this._cacheService
        .patchArm(`${this._resourceId}/config/web`, ARMApiVersions.antaresApiVersion20181101, {
          properties: {
            scmType: 'LocalGit',
          },
        })
        .map(r => r.json());
    } else {
      return this._cacheService
        .putArm(`${this._resourceId}/sourcecontrols/web`, ARMApiVersions.antaresApiVersion20181101, {
          properties: payload,
        })
        .map(r => r.json());
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

    await deploymentCenterData.createOrUpdateActionWorkflow(getArmToken(), requestContent);
    return deployKudu();
  };

  const deploy = () => {
    if (formProps.values.buildProvider === BuildProvider.GitHubAction) {
      // NOTE(michinoy): Only initiate writing a workflow configuration file if the branch does not already have it OR
      // the user opted to overwrite it.
      if (formProps.values.workflowOption === WorkflowOption.Overwrite || formProps.values.workflowOption === WorkflowOption.Add) {
        // this is async
        return deployGithubActions().map(result => ({ status: 'succeeded', statusMessage: null, result }));
      } else {
        return deployKudu().map(result => ({ status: 'succeeded', statusMessage: null, result }));
      }
    } else {
      return deployKudu().map(result => ({ status: 'succeeded', statusMessage: null, result }));
    }
  };

  const saveGithubActionsDeploymentSettings = (saveGuid: string) => {
    const notificationId = portalContext.startNotification(t('settingupDeployment'), t('githubActionSavingSettings'));
  };

  const saveAppServiceDeploymentSettings = (saveGuid: string) => {
    const notificationId = portalContext.startNotification(t('settingupDeployment'), t('settingupDeployment'));
  };

  const saveFunction = async () => {
    console.log(formProps);
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
