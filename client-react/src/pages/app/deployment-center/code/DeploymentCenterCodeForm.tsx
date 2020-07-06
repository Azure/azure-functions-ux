import React, { useState, useEffect } from 'react';
import { Formik, FormikProps } from 'formik';
import { DeploymentCenterFormData, DeploymentCenterCodeFormProps, DeploymentCenterCodeFormData } from '../DeploymentCenter.types';
import { KeyCodes } from 'office-ui-fabric-react';
import DeploymentCenterCommandBar from '../DeploymentCenterCommandBar';
import { commandBarSticky, pivotContent } from '../DeploymentCenter.styles';
import DeploymentCenterCodePivot from './DeploymentCenterCodePivot';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';

const DeploymentCenterCodeForm: React.FC<DeploymentCenterCodeFormProps> = props => {
  const { t } = useTranslation();
  const [isRefreshConfirmDialogVisible, setIsRefreshConfirmDialogVisible] = useState(false);

  // const portalContext = useContext(PortalContext);

  const onKeyDown = keyEvent => {
    if ((keyEvent.charCode || keyEvent.keyCode) === KeyCodes.enter) {
      keyEvent.preventDefault();
    }
  };

  // class SourceSettings {
  //   public repoUrl: string;
  //   public branch: string;
  //   public isManualIntegration: boolean;
  //   public isGitHubAction: boolean;
  //   public deploymentRollbackEnabled: boolean;
  //   public isMercurial: boolean;
  //   public privateRepo: boolean;
  //   public username: string;
  //   public password: string;
  //   public githubActionWorkflowOption: string;
  //   public githubActionExistingWorkflowContents: string;
  // }

  // const deployGithubActions = () => {
  //   const repo = this.wizardValues.sourceSettings.repoUrl.replace(`${DeploymentCenterConstants.githubUri}/`, '');
  //   const branch = this.wizardValues.sourceSettings.branch || 'master';
  //   const workflowInformation = this._githubService.getWorkflowInformation(
  //     this.wizardValues.buildSettings,
  //     this.wizardValues.sourceSettings,
  //     this.isLinuxApp,
  //     this.gitHubPublishProfileSecretGuid,
  //     this.siteName,
  //     this.slotName
  //   );

  //   const commitInfo: GitHubCommit = {
  //     repoName: repo,
  //     branchName: branch,
  //     filePath: `.github/workflows/${workflowInformation.fileName}`,
  //     message: this._translateService.instant(PortalResources.githubActionWorkflowCommitMessage),
  //     contentBase64Encoded: btoa(workflowInformation.content),
  //     committer: {
  //       name: 'Azure App Service',
  //       email: 'donotreply@microsoft.com',
  //     },
  //   };

  //   return this._githubService
  //     .fetchWorkflowConfiguration(this.getToken(), this.wizardValues.sourceSettings.repoUrl, repo, branch, commitInfo.filePath)
  //     .switchMap(fileContentResponse => {
  //       if (fileContentResponse) {
  //         commitInfo.sha = fileContentResponse.sha;
  //       }

  //       const requestContent: GitHubActionWorkflowRequestContent = {
  //         resourceId: this._resourceId,
  //         secretName: workflowInformation.secretName,
  //         commit: commitInfo,
  //       };

  //       return this._githubService.createOrUpdateActionWorkflow(this.getToken(), requestContent);
  //     })
  //     .switchMap(_ => {
  //       return this._deployKudu();
  //     });
  // };

  // const deploy = () => {
  //   if (formProps && formProps.values.buildProvider === BuildProvider.GitHubAction) {
  //     // NOTE(michinoy): Only initiate writing a workflow configuration file if the branch does not already have it OR
  //     // the user opted to overwrite it.
  //     if (formProps.values.workflowOption === WorkflowOption.Overwrite ||
  //       formProps.values.workflowOption === WorkflowOption.Add
  //     ) {
  //       return deployGithubActions().map(result => ({ status: 'succeeded', statusMessage: null, result }));
  //     } else {
  //       return deployKudu().map(result => ({ status: 'succeeded', statusMessage: null, result }));
  //     }
  //   } else {
  //     return deployKudu().map(result => ({ status: 'succeeded', statusMessage: null, result }));
  //   }
  // };

  // const saveGithubActionsDeploymentSettings = (saveGuid: string) => {

  // };

  // const saveAppServiceDeploymentSettings = (saveGuid: string) => {
  //   const notificationId = portalContext.startNotification(t('settingupDeployment'), t('settingupDeployment'));
  // };

  const saveFunction = () => {
    console.log(formProps ? formProps.values : 'not here');
    return;
    // const saveGuid = Guid.newGuid();
    // if (formProps && formProps.values.buildProvider === BuildProvider.GitHubAction) {
    //   saveGithubActionsDeploymentSettings(saveGuid);
    // } else {
    //   saveAppServiceDeploymentSettings(saveGuid);
    // }
    // throw Error('not implemented');
  };

  const discardFunction = () => {
    throw Error('not implemented');
  };

  const refreshFunction = () => {
    hideRefreshConfirmDialog();
    props.refresh();
  };

  const onSubmit = () => {
    throw Error('not implemented');
  };

  const hideRefreshConfirmDialog = () => {
    setIsRefreshConfirmDialogVisible(false);
  };

  useEffect(() => {
    console.log(formProps);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps]);

  return (
    <Formik
      initialValues={props.formData}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validateOnBlur={false}
      validateOnChange={true}
      validationSchema={props.formValidationSchema}>
      {(formProps: FormikProps<DeploymentCenterFormData<DeploymentCenterCodeFormData>>) => (
        <form onKeyDown={onKeyDown}>
          <div id="deployment-center-command-bar" className={commandBarSticky}>
            <DeploymentCenterCommandBar
              saveFunction={saveFunction}
              discardFunction={discardFunction}
              showPublishProfilePanel={props.showPublishProfilePanel}
              refresh={() => setIsRefreshConfirmDialogVisible(true)}
              isLoading={props.isLoading}
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
