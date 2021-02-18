import React, { useState, useContext } from 'react';
import { Formik, FormikProps, FormikActions } from 'formik';
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
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import {
  getCodeWebAppWorkflowInformation,
  getCodeFunctionAppCodeWorkflowInformation,
  isApiSyncError,
  updateGitHubActionSourceControlPropertiesManually,
} from '../utility/GitHubActionUtility';
import {
  getWorkflowFilePath,
  getArmToken,
  getTelemetryInfo,
  getWorkflowFileName,
  getSourceControlsWorkflowFileName,
} from '../utility/DeploymentCenterUtility';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { AppOs } from '../../../../models/site/site';
import GitHubService from '../../../../ApiHelpers/GitHubService';

const DeploymentCenterCodeForm: React.FC<DeploymentCenterCodeFormProps> = props => {
  const { t } = useTranslation();
  const [isRedeployConfirmDialogVisible, setIsRedeployConfirmDialogVisible] = useState(false);
  const [isDiscardConfirmDialogVisible, setIsDiscardConfirmDialogVisible] = useState(false);

  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const deploymentCenterData = new DeploymentCenterData();

  const deployKudu = async (values: DeploymentCenterFormData<DeploymentCenterCodeFormData>) => {
    //(NOTE: stpelleg) Only external git is expected to be manual integration
    // If manual integration is true the site config scm type is set to be external

    const payload: SiteSourceControlRequestBody = {
      repoUrl: getRepoUrl(values),
      branch: values.branch || 'master',
      isManualIntegration: values.sourceProvider === ScmType.ExternalGit,
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
      portalContext.log(getTelemetryInfo('info', 'updateSourceControls', 'submit'));

      const updateSourceControlResponse = await deploymentCenterData.updateSourceControlDetails(deploymentCenterContext.resourceId, {
        properties: payload,
      });

      if (
        !updateSourceControlResponse.metadata.success &&
        payload.isGitHubAction &&
        isApiSyncError(updateSourceControlResponse.metadata.error)
      ) {
        // NOTE(michinoy): If the save operation was being done for GitHub Action, and
        // we are experiencing the GeoRegionalService API error (500), run through the
        // workaround.
        portalContext.log(getTelemetryInfo('warning', 'updateSourceControlsWorkaround', 'submit'));

        return updateGitHubActionSourceControlPropertiesManually(deploymentCenterData, deploymentCenterContext.resourceId, payload);
      } else {
        if (!updateSourceControlResponse.metadata.success) {
          portalContext.log(
            getTelemetryInfo('error', 'updateSourceControlResponse', 'failed', {
              message: getErrorMessage(updateSourceControlResponse.metadata.error),
              errorAsString: updateSourceControlResponse.metadata.error ? JSON.stringify(updateSourceControlResponse.metadata.error) : '',
            })
          );
        }

        return updateSourceControlResponse;
      }
    }
  };

  const getRepoUrl = (values: DeploymentCenterFormData<DeploymentCenterCodeFormData>): string => {
    switch (values.sourceProvider) {
      case ScmType.GitHub:
        return `${DeploymentCenterConstants.githubUri}/${values.org}/${values.repo}`;
      case ScmType.BitbucketGit:
        return `${DeploymentCenterConstants.bitbucketUrl}/${values.org}/${values.repo}`;
      case ScmType.OneDrive:
        return `${DeploymentCenterConstants.onedriveApiUri}:/${values.folder}`;
      case ScmType.Dropbox:
        // TODO: (stpelleg): Pending Implementation of these ScmTypes
        return `${DeploymentCenterConstants.dropboxUri}/${values.folder}`;
      case ScmType.LocalGit:
        //(note: stpelleg): Local Git does not require a Repo Url
        return '';
      case ScmType.ExternalGit:
        const repoUrlParts = values.repo.split('://');
        const protocol = repoUrlParts[0];
        const hostContents = repoUrlParts[1];

        if (values.externalUsername && values.externalPassword) {
          return `${protocol}://${values.externalUsername}:${values.externalPassword}@${hostContents}`;
        }
        return values.repo;
      case ScmType.Vso:
        return values.repo;
      default:
        portalContext.log(
          getTelemetryInfo('error', 'getRepoUrl', 'incorrectValue', {
            sourceProvider: values.sourceProvider,
          })
        );
        throw Error(`Incorrect Source Provider ${values.sourceProvider}`);
    }
  };

  const deployGithubActions = async (values: DeploymentCenterFormData<DeploymentCenterCodeFormData>) => {
    portalContext.log(getTelemetryInfo('info', 'commitGitHubActions', 'submit'));

    const repo = `${values.org}/${values.repo}`;
    const branch = values.branch || 'master';

    const workflowInformation = siteStateContext.isFunctionApp
      ? getCodeFunctionAppCodeWorkflowInformation(
          values.runtimeStack,
          values.runtimeVersion,
          values.runtimeRecommendedVersion,
          branch,
          siteStateContext.isLinuxApp,
          values.gitHubPublishProfileSecretGuid,
          deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
          deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.slot : ''
        )
      : getCodeWebAppWorkflowInformation(
          values.runtimeStack,
          values.runtimeVersion,
          values.runtimeRecommendedVersion,
          branch,
          siteStateContext.isLinuxApp,
          values.gitHubPublishProfileSecretGuid,
          deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
          deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.slot : '',
          values.javaContainer
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

    // NOTE(michinoy): temporary fix, while the backend reinstates the scm url in the publish url property.
    const replacementPublishUrl = siteStateContext && siteStateContext.isLinuxApp ? getScmUri() : undefined;

    return deploymentCenterData.createOrUpdateActionWorkflow(
      getArmToken(),
      deploymentCenterContext.gitHubToken,
      requestContent,
      replacementPublishUrl
    );
  };

  const getScmUri = (): string | undefined => {
    if (
      deploymentCenterPublishingContext &&
      deploymentCenterPublishingContext.publishingCredentials &&
      deploymentCenterPublishingContext.publishingCredentials.properties.scmUri
    ) {
      const scmUriParts = deploymentCenterPublishingContext.publishingCredentials.properties.scmUri.split('@');

      if (scmUriParts.length > 1) {
        return scmUriParts[1];
      }
    }
    return undefined;
  };

  const deploy = async (values: DeploymentCenterFormData<DeploymentCenterCodeFormData>) => {
    const {
      sourceProvider,
      buildProvider,
      org,
      repo,
      branch,
      workflowOption,
      runtimeStack,
      runtimeVersion,
      runtimeRecommendedVersion,
      folder,
    } = values;

    portalContext.log(
      getTelemetryInfo('info', 'saveDeploymentSettings', 'start', {
        sourceProvider,
        buildProvider,
        org,
        repo,
        branch,
        folder,
        workflowOption,
        runtimeStack,
        runtimeVersion,
        runtimeRecommendedVersion,
        publishType: 'code',
        appType: siteStateContext.isFunctionApp ? 'functionApp' : 'webApp',
        os: siteStateContext.isLinuxApp ? AppOs.linux : AppOs.windows,
      })
    );

    // NOTE(michinoy): Only initiate writing a workflow configuration file if the branch does not already have it OR
    // the user opted to overwrite it.
    if (
      values.buildProvider === BuildProvider.GitHubAction &&
      (values.workflowOption === WorkflowOption.Overwrite || values.workflowOption === WorkflowOption.Add)
    ) {
      const gitHubActionDeployResponse = await deployGithubActions(values);
      if (!gitHubActionDeployResponse.metadata.success) {
        portalContext.log(
          getTelemetryInfo('error', 'gitHubActionDeployResponse', 'failed', {
            errorAsString: JSON.stringify(gitHubActionDeployResponse.metadata.error),
          })
        );

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

  const onSubmit = async (
    values: DeploymentCenterFormData<DeploymentCenterCodeFormData>,
    formikActions: FormikActions<DeploymentCenterFormData<DeploymentCenterCodeFormData>>
  ) => {
    portalContext.log(getTelemetryInfo('info', 'onSubmitCodeForm', 'submit'));

    await Promise.all([updateDeploymentConfigurations(values, formikActions), updatePublishingUser(values)]);
    await deploymentCenterContext.refresh();
    formikActions.setSubmitting(false);
    portalContext.updateDirtyState(false);
  };

  const updateDeploymentConfigurations = async (
    values: DeploymentCenterFormData<DeploymentCenterCodeFormData>,
    formikActions: FormikActions<DeploymentCenterFormData<DeploymentCenterCodeFormData>>
  ) => {
    // Only do the save if build provider is set by the user and the scmtype in the config is set to none.
    // If the scmtype in the config is not none, the user should be doing a disconnect operation first.
    // This check is in place, because the use could set the form props ina dirty state by just modifying the
    // publishing user information.
    if (
      values.buildProvider !== BuildProvider.None &&
      deploymentCenterContext.siteConfig &&
      deploymentCenterContext.siteConfig.properties.scmType === ScmType.None
    ) {
      // NOTE(stpelleg):Reset the form values only if deployment settings need to be updated.
      formikActions.resetForm(values);
      if (values.buildProvider === BuildProvider.GitHubAction) {
        await saveGithubActionsDeploymentSettings(values);
      } else {
        await saveAppServiceDeploymentSettings(values);
      }
    }
  };

  const updatePublishingUser = async (values: DeploymentCenterFormData<DeploymentCenterCodeFormData>) => {
    const currentUser = deploymentCenterPublishingContext.publishingUser;
    if (
      (currentUser && values.publishingUsername && currentUser.properties.publishingUserName !== values.publishingUsername) ||
      (currentUser && values.publishingPassword && values.publishingConfirmPassword)
    ) {
      portalContext.log(getTelemetryInfo('info', 'updatePublishingUser', 'submit'));

      const notificationId = portalContext.startNotification(t('UpdatingPublishingUser'), t('UpdatingPublishingUser'));
      currentUser.properties.publishingUserName = values.publishingUsername;
      currentUser.properties.publishingPassword = values.publishingPassword;
      const publishingUserResponse = await deploymentCenterData.updatePublishingUser(currentUser);

      if (publishingUserResponse.metadata.success) {
        portalContext.stopNotification(notificationId, true, t('UpdatingPublishingUserSuccess'));
      } else {
        const errorMessage = getErrorMessage(publishingUserResponse.metadata.error);
        errorMessage
          ? portalContext.stopNotification(notificationId, false, t('UpdatingPublishingUserFailWithStatusMessage').format(errorMessage))
          : portalContext.stopNotification(notificationId, false, t('UpdatingPublishingUserFail'));

        portalContext.log(
          getTelemetryInfo('error', 'publishingUserResponse', 'failed', {
            message: errorMessage,
            errorAsString: JSON.stringify(publishingUserResponse.metadata.error),
          })
        );
      }
    }
  };

  const onKeyDown = keyEvent => {
    if ((keyEvent.charCode || keyEvent.keyCode) === KeyCodes.enter) {
      keyEvent.preventDefault();
    }
  };

  const redeployFunction = async () => {
    hideRedeployConfirmDialog();

    const siteName = siteStateContext && siteStateContext.site ? siteStateContext.site.name : '';
    const notificationId = portalContext.startNotification(
      t('deploymentCenterCodeRedeployRequestSubmitted'),
      t('deploymentCenterCodeRedeployRequestSubmittedDesc').format(siteName)
    );

    const isGitHubActionsSetup =
      deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction;

    if (isGitHubActionsSetup) {
      redeployGitHubActions(notificationId, siteName);
    } else {
      redeployKudu(notificationId, siteName);
    }
  };

  const redeployKudu = async (notificationId: string, siteName: string) => {
    const redeployResponse = await SiteService.syncSourceControls(deploymentCenterContext.resourceId);
    if (redeployResponse.metadata.success) {
      portalContext.stopNotification(notificationId, true, t('deploymentCenterCodeRedeploySuccess').format(siteName));
    } else {
      handleRedeployError(redeployResponse, notificationId, 'syncSourceControls');
    }
  };

  const redeployGitHubActions = async (notificationId: string, siteName: string) => {
    let branch = '';
    let repo = '';
    let org = '';

    const sourceControlDetailsResponse = await deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);
    if (sourceControlDetailsResponse.metadata.success) {
      branch = sourceControlDetailsResponse.data.properties.branch;

      const repoUrlSplit = sourceControlDetailsResponse.data.properties.repoUrl.split('/');
      if (repoUrlSplit.length >= 2) {
        org = repoUrlSplit[repoUrlSplit.length - 2];
        repo = repoUrlSplit[repoUrlSplit.length - 1];
      }
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'getSourceControls', 'failed', {
          message: getErrorMessage(sourceControlDetailsResponse.metadata.error),
        })
      );
    }

    const isProductionSlot =
      deploymentCenterContext.siteDescriptor &&
      (!deploymentCenterContext.siteDescriptor.slot || deploymentCenterContext.siteDescriptor.slot.toLocaleLowerCase() === 'production');

    if (isProductionSlot) {
      dispatchAppOrSourceControlsWorkflow(`${org}/${repo}`, branch, notificationId, siteName);
    } else {
      dispatchAppOnlyWorkflow(`${org}/${repo}`, branch, notificationId, siteName);
    }
  };

  const dispatchAppOnlyWorkflow = async (repo: string, branch: string, notificationId: string, siteName: string) => {
    const workflowFileName = getWorkflowFileName(
      branch,
      deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
      deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.slot : ''
    );
    const workflowDispatchResponse = await GitHubService.dispatchWorkflow(
      deploymentCenterContext.gitHubToken,
      branch,
      repo,
      workflowFileName
    );

    if (workflowDispatchResponse.metadata.success) {
      portalContext.stopNotification(notificationId, true, t('deploymentCenterCodeRedeploySuccess').format(siteName));
    } else {
      handleRedeployError(workflowDispatchResponse, notificationId, 'dispatchWorkflow');
    }
  };

  const dispatchAppOrSourceControlsWorkflow = async (repo: string, branch: string, notificationId: string, siteName: string) => {
    const workflowFileName = getWorkflowFileName(
      branch,
      deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
      deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.slot : ''
    );
    const sourceControlsWorkflowFileName = getSourceControlsWorkflowFileName(
      branch,
      deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
      'production'
    );

    const [appWorkflowDispatchResponse, sourceControlsWorkflowDispatchResponse] = await Promise.all([
      GitHubService.dispatchWorkflow(deploymentCenterContext.gitHubToken, branch, repo, workflowFileName),
      GitHubService.dispatchWorkflow(deploymentCenterContext.gitHubToken, branch, repo, sourceControlsWorkflowFileName),
    ]);

    if (appWorkflowDispatchResponse.metadata.success || sourceControlsWorkflowDispatchResponse.metadata.success) {
      portalContext.stopNotification(notificationId, true, t('deploymentCenterCodeRedeploySuccess').format(siteName));
    } else if (appWorkflowDispatchResponse.metadata.status === 404 && sourceControlsWorkflowDispatchResponse.metadata.status !== 404) {
      handleRedeployError(sourceControlsWorkflowDispatchResponse, notificationId, 'dispatchWorkflow');
    } else {
      handleRedeployError(appWorkflowDispatchResponse, notificationId, 'dispatchWorkflow');
    }
  };

  const handleRedeployError = (response: any, notificationId: string, action: string) => {
    const errorMessage = getErrorMessage(response.metadata.error);
    errorMessage
      ? portalContext.stopNotification(notificationId, false, t('deploymentCenterCodeRedeployFailWithStatusMessage').format(errorMessage))
      : portalContext.stopNotification(notificationId, false, t('deploymentCenterCodeRedeployFail'));

    portalContext.log(
      getTelemetryInfo('error', action, 'failed', {
        message: errorMessage,
      })
    );
  };

  const hideRedeployConfirmDialog = () => {
    setIsRedeployConfirmDialogVisible(false);
  };

  const hideDiscardConfirmDialog = () => {
    setIsDiscardConfirmDialogVisible(false);
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
              isDirty={formProps.dirty}
              isLoading={props.isLoading}
              isVstsBuildProvider={formProps.values.buildProvider === BuildProvider.Vsts}
              saveFunction={formProps.submitForm}
              showPublishProfilePanel={deploymentCenterPublishingContext.showPublishProfilePanel}
              discardFunction={() => setIsDiscardConfirmDialogVisible(true)}
              redeploy={() => setIsRedeployConfirmDialogVisible(true)}
            />
          </div>
          <>
            <ConfirmDialog
              primaryActionButton={{
                title: t('ok'),
                onClick: redeployFunction,
              }}
              defaultActionButton={{
                title: t('cancel'),
                onClick: hideRedeployConfirmDialog,
              }}
              title={t('deploymentCenterRedeployConfirmTitle')}
              content={t('deploymentCenterRedeployConfirmMessage')}
              hidden={!isRedeployConfirmDialogVisible}
              onDismiss={hideRedeployConfirmDialog}
            />
            <ConfirmDialog
              primaryActionButton={{
                title: t('ok'),
                onClick: () => {
                  formProps.resetForm();
                  formProps.values.sourceProvider = ScmType.None;
                  formProps.values.buildProvider = BuildProvider.None;
                  hideDiscardConfirmDialog();
                },
              }}
              defaultActionButton={{
                title: t('cancel'),
                onClick: hideDiscardConfirmDialog,
              }}
              title={t('deploymentCenterDiscardConfirmTitle')}
              content={t('deploymentCenterDataLossMessage')}
              hidden={!isDiscardConfirmDialogVisible}
              onDismiss={hideDiscardConfirmDialog}
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
