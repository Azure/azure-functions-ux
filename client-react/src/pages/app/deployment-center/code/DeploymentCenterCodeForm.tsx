import React, { useState, useContext } from 'react';
import { Formik, FormikProps } from 'formik';
import {
  DeploymentCenterFormData,
  DeploymentCenterCodeFormProps,
  DeploymentCenterCodeFormData,
  SiteSourceControlRequestBody,
  WorkflowOption,
} from '../DeploymentCenter.types';
import { KeyCodes } from 'office-ui-fabric-react';
import { commandBarSticky, pivotContent } from '../DeploymentCenter.styles';
import DeploymentCenterCodePivot from './DeploymentCenterCodePivot';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import { SiteStateContext } from '../../../../SiteState';
import { PortalContext } from '../../../../PortalContext';
import SiteService from '../../../../ApiHelpers/SiteService';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterCommandBar from '../DeploymentCenterCommandBar';
import { BuildProvider, ScmType } from '../../../../models/site/config';
import { GitHubActionWorkflowRequestContent, GitHubCommit } from '../../../../models/github';
import DeploymentCenterData from '../DeploymentCenter.data';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import { getCodeAppWorkflowInformation } from '../utility/GitHubActionUtility';
import { getWorkflowFilePath, getArmToken } from '../utility/DeploymentCenterUtility';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';

const DeploymentCenterCodeForm: React.FC<DeploymentCenterCodeFormProps> = props => {
  const { t } = useTranslation();
  const [isRefreshConfirmDialogVisible, setIsRefreshConfirmDialogVisible] = useState(false);
  const [isSyncConfirmDialogVisible, setIsSyncConfirmDialogVisible] = useState(false);

  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const deploymentCenterData = new DeploymentCenterData();

  const deployKudu = (values: DeploymentCenterFormData<DeploymentCenterCodeFormData>) => {
    const payload: SiteSourceControlRequestBody = {
      repoUrl: getRepoUrl(values),
      branch: values.branch || 'master',
      isManualIntegration: isManualIntegration(values),
      isGitHubAction: values.buildProvider === BuildProvider.GitHubAction,
      isMercurial: false,
    };

    if (values.sourceProvider === ScmType.LocalGit) {
      return deploymentCenterData.patchSiteConfig(deploymentCenterContext.resourceId, {
        properties: {
          scmType: 'LocalGit',
        },
      });
    } else {
      return deploymentCenterData.updateSourceControlDetails(deploymentCenterContext.resourceId, { properties: payload });
    }
  };

  const isManualIntegration = (values: DeploymentCenterFormData<DeploymentCenterCodeFormData>): boolean => {
    switch (values.sourceProvider) {
      case ScmType.GitHub:
      case ScmType.BitbucketGit:
      case ScmType.LocalGit:
        return false;
      case ScmType.OneDrive:
      case ScmType.Dropbox:
      case ScmType.ExternalGit:
        return true;
      default:
        LogService.error(
          LogCategories.deploymentCenter,
          'DeploymentCenterCodeCommandBar',
          `Incorrect Source Provider ${values.sourceProvider}`
        );
        throw Error(`Incorrect Source Provider ${values.sourceProvider}`);
    }
  };

  const getRepoUrl = (values: DeploymentCenterFormData<DeploymentCenterCodeFormData>): string => {
    switch (values.sourceProvider) {
      case ScmType.GitHub:
        return `${DeploymentCenterConstants.githubUri}/${values.org}/${values.repo}`;
      case ScmType.BitbucketGit:
        return `${DeploymentCenterConstants.bitbucketUrl}/${values.org}/${values.repo}`;
      case ScmType.OneDrive:
      case ScmType.Dropbox:
        // TODO: (stpelleg): Pending Implementation of these ScmTypes
        throw Error('Not implemented');
      case ScmType.LocalGit:
        //(note: stpelleg): Local Git does not require a Repo Url
        return '';
      case ScmType.ExternalGit:
        if (values.externalUsername && values.externalPassword) {
          const repoPath = values.repo.toLocaleLowerCase().replace('https://', '');
          return `https://${values.externalUsername}:${values.externalPassword}@${repoPath}`;
        }
        return values.repo;
      default:
        LogService.error(
          LogCategories.deploymentCenter,
          'DeploymentCenterCodeCommandBar',
          `Incorrect Source Provider ${values.sourceProvider}`
        );
        throw Error(`Incorrect Source Provider ${values.sourceProvider}`);
    }
  };

  const deployGithubActions = async (values: DeploymentCenterFormData<DeploymentCenterCodeFormData>) => {
    const repo = `${values.org}/${values.repo}`;
    const branch = values.branch || 'master';

    const workflowInformation = getCodeAppWorkflowInformation(
      values.runtimeStack,
      values.runtimeVersion,
      values.runtimeRecommendedVersion,
      branch,
      siteStateContext.isLinuxApp,
      values.gitHubPublishProfileSecretGuid,
      deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
      deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.slot : ''
    );

    const commitInfo: GitHubCommit = {
      repoName: repo,
      branchName: branch,
      filePath: getWorkflowFilePath(
        branch,
        deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
        deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.slot : ''
      ),
      message: t('githubActionWorkflowCommitMessage'),
      contentBase64Encoded: btoa(workflowInformation.content),
      committer: {
        name: 'Azure App Service',
        email: 'donotreply@microsoft.com',
      },
    };

    const workflowConfigurationResponse = await deploymentCenterData.getWorkflowConfiguration(
      values.org,
      values.repo,
      branch,
      commitInfo.filePath,
      deploymentCenterContext.gitHubToken
    );

    // NOTE(michinoy): A failure here means the file does not exist and we do not need to copy over the sha.
    // No need to log anything.
    if (workflowConfigurationResponse.metadata.success) {
      commitInfo.sha = workflowConfigurationResponse.data.sha;
    }

    const requestContent: GitHubActionWorkflowRequestContent = {
      resourceId: deploymentCenterContext.resourceId,
      secretName: workflowInformation.secretName,
      commit: commitInfo,
    };

    return deploymentCenterData.createOrUpdateActionWorkflow(getArmToken(), deploymentCenterContext.gitHubToken, requestContent);
  };

  const deploy = async (values: DeploymentCenterFormData<DeploymentCenterCodeFormData>) => {
    // NOTE(michinoy): Only initiate writing a workflow configuration file if the branch does not already have it OR
    // the user opted to overwrite it.
    if (
      values.buildProvider === BuildProvider.GitHubAction &&
      (values.workflowOption === WorkflowOption.Overwrite || values.workflowOption === WorkflowOption.Add)
    ) {
      const gitHubActionDeployResponse = await deployGithubActions(values);
      if (!gitHubActionDeployResponse.metadata.success) {
        return gitHubActionDeployResponse;
      }
    }

    return deployKudu(values);
  };

  const saveGithubActionsDeploymentSettings = async (values: DeploymentCenterFormData<DeploymentCenterCodeFormData>) => {
    const notificationId = portalContext.startNotification(t('settingupDeployment'), t('githubActionSavingSettings'));
    const deployResponse = await deploy(values);
    if (deployResponse.metadata.success) {
      portalContext.stopNotification(notificationId, true, t('githubActionSettingsSavedSuccessfully'));
    } else {
      const errorMessage = getErrorMessage(deployResponse.metadata.error);
      errorMessage
        ? portalContext.stopNotification(notificationId, false, t('settingupDeploymentFailWithStatusMessage').format(errorMessage))
        : portalContext.stopNotification(notificationId, false, t('settingupDeploymentFail'));
    }
  };

  const saveAppServiceDeploymentSettings = async (values: DeploymentCenterFormData<DeploymentCenterCodeFormData>) => {
    const notificationId = portalContext.startNotification(t('settingupDeployment'), t('settingupDeployment'));
    const deployResponse = await deploy(values);
    if (deployResponse.metadata.success) {
      portalContext.stopNotification(notificationId, true, t('settingupDeploymentSuccess'));
    } else {
      const errorMessage = getErrorMessage(deployResponse.metadata.error);
      errorMessage
        ? portalContext.stopNotification(notificationId, false, t('settingupDeploymentFailWithStatusMessage').format(errorMessage))
        : portalContext.stopNotification(notificationId, false, t('settingupDeploymentFail'));
    }
  };

  const onSubmit = async (values: DeploymentCenterFormData<DeploymentCenterCodeFormData>) => {
    if (values.buildProvider === BuildProvider.GitHubAction) {
      await saveGithubActionsDeploymentSettings(values);
    } else {
      await saveAppServiceDeploymentSettings(values);
    }
    deploymentCenterContext.refresh();
  };

  const onKeyDown = keyEvent => {
    if ((keyEvent.charCode || keyEvent.keyCode) === KeyCodes.enter) {
      keyEvent.preventDefault();
    }
  };

  const refreshFunction = () => {
    hideRefreshConfirmDialog();
    props.refresh();
  };

  const hideRefreshConfirmDialog = () => {
    setIsRefreshConfirmDialogVisible(false);
  };

  const syncFunction = async () => {
    hideSyncConfirmDialog();
    const siteName = siteStateContext && siteStateContext.site ? siteStateContext.site.name : '';
    const notificationId = portalContext.startNotification(
      t('deploymentCenterCodeSyncRequestSubmitted'),
      t('deploymentCenterCodeSyncRequestSubmittedDesc').format(siteName)
    );
    const syncResponse = await SiteService.syncSourceControls(deploymentCenterContext.resourceId);
    if (syncResponse.metadata.success) {
      portalContext.stopNotification(notificationId, true, t('deploymentCenterCodeSyncSuccess').format(siteName));
    } else {
      const errorMessage = getErrorMessage(syncResponse.metadata.error);
      errorMessage
        ? portalContext.stopNotification(notificationId, false, t('deploymentCenterCodeSyncFailWithStatusMessage').format(errorMessage))
        : portalContext.stopNotification(notificationId, false, t('deploymentCenterCodeSyncFail'));
    }
  };

  const hideSyncConfirmDialog = () => {
    setIsSyncConfirmDialogVisible(false);
  };

  return (
    <Formik
      initialValues={props.formData}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={props.formValidationSchema}>
      {(formProps: FormikProps<DeploymentCenterFormData<DeploymentCenterCodeFormData>>) => (
        <form onKeyDown={onKeyDown}>
          <div id="deployment-center-command-bar" className={commandBarSticky}>
            <DeploymentCenterCommandBar
              isLoading={props.isLoading}
              saveFunction={formProps.submitForm}
              discardFunction={formProps.resetForm}
              showPublishProfilePanel={deploymentCenterPublishingContext.showPublishProfilePanel}
              refresh={() => setIsRefreshConfirmDialogVisible(true)}
              sync={() => setIsSyncConfirmDialogVisible(true)}
            />
          </div>
          <>
            <ConfirmDialog
              primaryActionButton={{
                title: t('ok'),
                onClick: refreshFunction,
              }}
              defaultActionButton={{
                title: t('cancel'),
                onClick: hideRefreshConfirmDialog,
              }}
              title={t('staticSite_refreshConfirmTitle')}
              content={t('staticSite_refreshConfirmMessage')}
              hidden={!isRefreshConfirmDialogVisible}
              onDismiss={hideRefreshConfirmDialog}
            />
            <ConfirmDialog
              primaryActionButton={{
                title: t('ok'),
                onClick: syncFunction,
              }}
              defaultActionButton={{
                title: t('cancel'),
                onClick: hideSyncConfirmDialog,
              }}
              title={t('staticSite_syncConfirmTitle')}
              content={t('staticSite_syncConfirmMessage')}
              hidden={!isSyncConfirmDialogVisible}
              onDismiss={hideSyncConfirmDialog}
            />
          </>
          <div className={pivotContent}>
            <DeploymentCenterCodePivot {...props} formProps={formProps} />
          </div>
        </form>
      )}
    </Formik>
  );
};

export default DeploymentCenterCodeForm;
