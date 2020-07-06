import React, { useContext } from 'react';
import DeploymentCenterCommandBar from '../DeploymentCenterCommandBar';
import { DeploymentCenterCodeCommandBarProps, WorkflowOption } from '../DeploymentCenter.types';
import { Guid } from '../../../../utils/Guid';
import { BuildProvider } from '../../../../models/site/config';
import { useTranslation } from 'react-i18next';
import { PortalContext } from '../../../../PortalContext';
import { getWorkflowInformation } from '../utility/GitHubActionUtility';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { GitHubCommit } from '../../../../models/github';

const DeploymentCenterCodeCommandBar: React.FC<DeploymentCenterCodeCommandBarProps> = props => {
  const { isLoading, showPublishProfilePanel, refresh, formProps } = props;

  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);

  class SourceSettings {
    public repoUrl: string;
    public branch: string;
    public isManualIntegration: boolean;
    public isGitHubAction: boolean;
    public deploymentRollbackEnabled: boolean;
    public isMercurial: boolean;
  }

  const deployGithubActions = () => {
    if (formProps && deploymentCenterContext.siteDescriptor) {
      // org/repo
      const repo = this.wizardValues.sourceSettings.repoUrl.replace(`${DeploymentCenterConstants.githubUri}/`, '');
      const branch = formProps.values.branch || 'master';

      const workflowInformation = getWorkflowInformation(
        formProps.values.runtimeStack,
        formProps.values.runtimeVersion,
        formProps.values.runtimeRecommendedVersion,
        formProps.values.branch,
        deploymentCenterContext.isLinuxApplication,
        formProps.values.gitHubPublishProfileSecretGuid,
        deploymentCenterContext.siteDescriptor.site,
        deploymentCenterContext.siteDescriptor.slot
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

      return this._githubService
        .fetchWorkflowConfiguration(this.getToken(), this.wizardValues.sourceSettings.repoUrl, repo, branch, commitInfo.filePath)
        .switchMap(fileContentResponse => {
          if (fileContentResponse) {
            commitInfo.sha = fileContentResponse.sha;
          }

          const requestContent: GitHubActionWorkflowRequestContent = {
            resourceId: this._resourceId,
            secretName: workflowInformation.secretName,
            commit: commitInfo,
          };

          return this._githubService.createOrUpdateActionWorkflow(this.getToken(), requestContent);
        })
        .switchMap(_ => {
          return this._deployKudu();
        });
    }
  };

  const deploy = () => {
    if (formProps && formProps.values.buildProvider === BuildProvider.GitHubAction) {
      // NOTE(michinoy): Only initiate writing a workflow configuration file if the branch does not already have it OR
      // the user opted to overwrite it.
      if (formProps.values.workflowOption === WorkflowOption.Overwrite || formProps.values.workflowOption === WorkflowOption.Add) {
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

  const saveFunction = () => {
    console.log(formProps);
    const saveGuid = Guid.newGuid();
    if (formProps && formProps.values.buildProvider === BuildProvider.GitHubAction) {
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
