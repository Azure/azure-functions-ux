import { Component } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BusyStateScopeManager } from 'app/busy-state/busy-state-scope-manager';
import { Subject } from 'rxjs/Subject';
import { LogService } from 'app/shared/services/log.service';
import { LogCategories, SiteTabIds } from 'app/shared/models/constants';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { PortalService } from '../../../../shared/services/portal.service';
import { Guid } from 'app/shared/Utilities/Guid';
import { PythonFrameworkType } from '../wizard-logic/deployment-center-setup-models';
import { GithubService } from '../wizard-logic/github.service';
import { WorkflowOptions } from '../../Models/deployment-enums';

interface SummaryItem {
  label: string;
  value: string;
}

interface SummaryGroup {
  label: string;
  items: SummaryItem[];
}

@Component({
  selector: 'app-step-complete',
  templateUrl: './step-complete.component.html',
  styleUrls: ['./step-complete.component.scss', '../deployment-center-setup.component.scss'],
})
export class StepCompleteComponent {
  resourceId: string;
  private _busyManager: BusyStateScopeManager;
  private _ngUnsubscribe$ = new Subject();
  private _saveDeploymentConfig$ = new Subject();
  private _isSaveDeploymentConfigInProgress = false;

  constructor(
    public wizard: DeploymentCenterStateManager,
    private _broadcastService: BroadcastService,
    private _translateService: TranslateService,
    private _portalService: PortalService,
    private _logService: LogService,
    private _githubService: GithubService
  ) {
    this._busyManager = new BusyStateScopeManager(_broadcastService, SiteTabIds.continuousDeployment);

    this.wizard.resourceIdStream$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
      this.resourceId = r;
    });

    this._saveDeploymentConfig$
      .takeUntil(this._ngUnsubscribe$)
      .debounceTime(500)
      .subscribe(_ => {
        if (this._isSaveDeploymentConfigInProgress) {
          return;
        }
        this._isSaveDeploymentConfigInProgress = true;
        this._busyManager.setBusy();
        this._saveDeploymentConfig();
      });
  }

  Save() {
    this._traceStepComplete();
    this._saveDeploymentConfig$.next(true);
  }

  private _saveDeploymentConfig() {
    const saveGuid = Guid.newGuid();
    this._portalService.logAction('deploymentcenter', 'save', {
      id: saveGuid,
      buildProvider: this.wizard.wizardValues.buildProvider,
      sourceProvider: this.wizard.wizardValues.sourceProvider,
    });

    if (this.wizard.wizardValues.sourceProvider === 'github' && this.wizard.wizardValues.buildProvider === 'github') {
      this._saveGithubActionsDeploymentSettings(saveGuid);
    } else {
      this._saveAppServiceDeploymentSettings(saveGuid);
    }
  }

  private _saveAppServiceDeploymentSettings(saveGuid: string) {
    let notificationId = null;
    this._portalService
      .startNotification(
        this._translateService.instant(PortalResources.settingupDeployment),
        this._translateService.instant(PortalResources.settingupDeployment)
      )
      .take(1)
      .do(notification => {
        notificationId = notification.id;
      })
      .concatMap(() => this.wizard.deploy())
      .subscribe(
        r => {
          this.clearBusy();
          if (r.status === 'succeeded') {
            this._portalService.stopNotification(
              notificationId,
              true,
              this._translateService.instant(PortalResources.settingupDeploymentSuccess)
            );
            this._broadcastService.broadcastEvent<void>(BroadcastEvent.ReloadDeploymentCenter);
            this._portalService.logAction('deploymentcenter', 'save', {
              id: saveGuid,
              succeeded: 'true',
            });
          } else {
            this._portalService.stopNotification(
              notificationId,
              false,
              this._translateService.instant(PortalResources.settingupDeploymentFailWithStatusMessage).format(r.statusMessage)
            );
            this._logService.error(LogCategories.cicd, '/step-complete', { resourceId: this.wizard.siteArm.id, status: r.status });
            this._portalService.logAction('deploymentcenter', 'save', {
              id: saveGuid,
              succeeded: 'false',
              statusMessage: r.statusMessage,
            });
          }
        },
        err => {
          this.clearBusy();

          const errorMessage =
            err && err.message
              ? err.message
              : err && err.json() && err.json().message
                ? err && err.json() && err.json().message
                : this._translateService.instant(PortalResources.settingupDeploymentFail);

          this._portalService.stopNotification(notificationId, false, errorMessage);
          this._logService.error(LogCategories.cicd, '/step-complete', { resourceId: this.wizard.siteArm.id, error: err });
          this._portalService.logAction('deploymentcenter', 'save', {
            id: saveGuid,
            succeeded: 'false',
          });
        }
      );
  }

  private _saveGithubActionsDeploymentSettings(saveGuid: string) {
    let notificationId = null;
    this._portalService
      .startNotification(
        this._translateService.instant(PortalResources.settingupDeployment),
        this._translateService.instant(PortalResources.githubActionSavingSettings)
      )
      .take(1)
      .do(notification => {
        notificationId = notification.id;
      })
      .concatMap(() => this.wizard.deploy())
      .subscribe(
        r => {
          this.clearBusy();
          if (r.status === 'succeeded') {
            this._portalService.stopNotification(
              notificationId,
              true,
              this._translateService.instant(PortalResources.githubActionSettingsSavedSuccessfully)
            );
            this._broadcastService.broadcastEvent<void>(BroadcastEvent.ReloadDeploymentCenter);
            this._portalService.logAction('deploymentcenter', 'save', {
              id: saveGuid,
              succeeded: 'true',
            });
          } else {
            this._portalService.stopNotification(
              notificationId,
              false,
              this._translateService.instant(PortalResources.settingupDeploymentFailWithStatusMessage).format(r.statusMessage)
            );
            this._logService.error(LogCategories.cicd, '/step-complete', {
              resourceId: this.wizard.siteArm.id,
              error: { message: r.statusMessage },
            });
            this._portalService.logAction('deploymentcenter', 'save', {
              id: saveGuid,
              succeeded: 'false',
              statusMessage: r.statusMessage,
            });
          }
        },
        err => {
          this.clearBusy();

          const errorMessage =
            err && err.json() && err.json().message
              ? err.json().message
              : this._translateService.instant(PortalResources.settingupDeploymentFail);

          this._portalService.stopNotification(notificationId, false, errorMessage);
          this._logService.error(LogCategories.cicd, '/step-complete', { resourceId: this.wizard.siteArm.id, error: err });
          this._portalService.logAction('deploymentcenter', 'save', {
            id: saveGuid,
            succeeded: 'false',
          });
        }
      );
  }

  clearBusy() {
    this._busyManager.clearBusy();
    this._isSaveDeploymentConfigInProgress = false;
  }

  get SummaryGroups(): SummaryGroup[] {
    const returnVal = [this._sourceControlGroup(), this._buildControlgroup()];

    return returnVal;
  }

  get ExistingGitHubActionConfigurationMessage() {
    if (this.wizard.wizardValues.sourceSettings.githubActionWorkflowOption === WorkflowOptions.Overwrite) {
      return this._translateService.instant(PortalResources.githubActionWorkflowOptionOverwriteMessage);
    } else if (this.wizard.wizardValues.sourceSettings.githubActionWorkflowOption === WorkflowOptions.UseExisting) {
      return this.wizard.wizardValues.sourceSettings.githubActionExistingWorkflowContents
        ? this._translateService.instant(PortalResources.githubActionWorkflowOptionUseExistingMessage)
        : this._translateService.instant(PortalResources.githubActionWorkflowOptionUseExistingMessageWithoutPreview);
    } else {
      return '';
    }
  }

  get GithubActionsWorkflowConfig() {
    if (this._generateWorkflowInformation()) {
      const information = this._githubService.getWorkflowInformation(
        this.wizard.wizardValues.buildSettings,
        this.wizard.wizardValues.sourceSettings,
        this.wizard.isLinuxApp,
        this.wizard.gitHubPublishProfileSecretGuid,
        this.wizard.siteName,
        this.wizard.slotName
      );

      return information.content;
    } else if (this._useExistingWorkflow()) {
      return this.wizard.wizardValues.sourceSettings.githubActionExistingWorkflowContents;
    } else {
      return '';
    }
  }

  private _generateWorkflowInformation() {
    return (
      this.wizard.wizardValues.sourceSettings.repoUrl &&
      this.wizard.wizardValues.sourceSettings.branch &&
      this.wizard.wizardValues.buildSettings.runtimeStack &&
      this.wizard.wizardValues.buildSettings.runtimeStackVersion &&
      (!this.wizard.wizardValues.sourceSettings.githubActionWorkflowOption ||
        this.wizard.wizardValues.sourceSettings.githubActionWorkflowOption === WorkflowOptions.Overwrite)
    );
  }

  private _useExistingWorkflow() {
    return (
      this.wizard.wizardValues.sourceSettings.repoUrl &&
      this.wizard.wizardValues.sourceSettings.branch &&
      this.wizard.wizardValues.sourceSettings.githubActionWorkflowOption === WorkflowOptions.UseExisting
    );
  }

  private _buildControlgroup(): SummaryGroup {
    const wizValues = this.wizard.wizardValues;
    const buildProvider = wizValues.buildProvider;
    const returnSummaryItems = [];

    if (buildProvider === 'kudu') {
      returnSummaryItems.push(...this._getKuduBuildSummary());
    } else if (buildProvider === 'github') {
      returnSummaryItems.push(...this._getGitHubActionBuildSummary());
    } else {
      returnSummaryItems.push(...this._getDevOpsBuildSummary());
    }

    return {
      label: this._translateService.instant(PortalResources.buildProvider),
      items: returnSummaryItems,
    };
  }

  private _getKuduBuildSummary() {
    return [
      {
        label: this._translateService.instant(PortalResources.provider),
        value: this._translateService.instant(PortalResources.kuduTitle),
      },
    ];
  }

  private _getGitHubActionBuildSummary() {
    const includeFileName =
      !this.wizard.wizardValues.sourceSettings.githubActionWorkflowOption ||
      this.wizard.wizardValues.sourceSettings.githubActionWorkflowOption === WorkflowOptions.Overwrite ||
      this.wizard.wizardValues.sourceSettings.githubActionExistingWorkflowContents;

    const items = [
      {
        label: this._translateService.instant(PortalResources.provider),
        value: this._translateService.instant(PortalResources.gitHubActionBuildServerTitle),
      },
    ];

    if (includeFileName) {
      items.push({
        label: this._translateService.instant(PortalResources.gitHubActionWorkflowFileNameTitle),
        value: this._githubService.getWorkflowFileName(
          this.wizard.wizardValues.sourceSettings.branch,
          this.wizard.siteName,
          this.wizard.slotName
        ),
      });
    }

    return items;
  }

  private _getDevOpsBuildSummary() {
    const returnSummaryItems = [];
    const wizValues = this.wizard.wizardValues;
    const buildSettings = wizValues.buildSettings;
    const appFramework = wizValues.buildSettings.applicationFramework;

    returnSummaryItems.push({
      label: this._translateService.instant(PortalResources.provider),
      value: this._translateService.instant(PortalResources.vstsBuildServerTitle),
    });

    returnSummaryItems.push({
      label: this._translateService.instant(PortalResources.newAccount),
      value: buildSettings.createNewVsoAccount
        ? this._translateService.instant(PortalResources.yes)
        : this._translateService.instant(PortalResources.no),
    });

    returnSummaryItems.push({
      label: this._translateService.instant(PortalResources.account),
      value: buildSettings.vstsAccount,
    });

    if (!wizValues.buildSettings.createNewVsoAccount) {
      returnSummaryItems.push({
        label: this._translateService.instant(PortalResources.project),
        value: buildSettings.vstsProject,
      });
    }

    if (wizValues.buildSettings.createNewVsoAccount) {
      returnSummaryItems.push({
        label: this._translateService.instant(PortalResources.location),
        value: buildSettings.location,
      });
    }

    returnSummaryItems.push({
      label: this._translateService.instant(PortalResources.webAppFramework),
      value: buildSettings.applicationFramework,
    });

    if (this.wizard.isLinuxApp) {
      returnSummaryItems.push({
        label: this._translateService.instant(PortalResources.frameworkVersion),
        value: buildSettings.frameworkVersion,
      });
    }

    if (appFramework !== 'AspNetWap' && appFramework !== 'AspNetCore' && !!buildSettings.workingDirectory) {
      returnSummaryItems.push({
        label: this._translateService.instant(PortalResources.workingDirectory),
        value: buildSettings.workingDirectory,
      });
    }

    if (appFramework === 'Node') {
      returnSummaryItems.push({
        label: this._translateService.instant(PortalResources.taskRunner),
        value: buildSettings.nodejsTaskRunner,
      });
    }

    if (appFramework === 'Python') {
      returnSummaryItems.push({
        label: this._translateService.instant(PortalResources.pythonVersionLabel),
        value: buildSettings.pythonSettings.version,
      });

      let frameWorkValue = '';
      switch (buildSettings.pythonSettings.framework) {
        case PythonFrameworkType.Bottle:
          frameWorkValue = 'Bottle';
          break;
        case PythonFrameworkType.Flask:
          frameWorkValue = 'Flask';
          break;
        case PythonFrameworkType.Django:
          frameWorkValue = 'Django';
          break;
      }
      returnSummaryItems.push({
        label: this._translateService.instant(PortalResources.pythonFramework),
        value: frameWorkValue,
      });

      if (wizValues.buildSettings.pythonSettings.framework === PythonFrameworkType.Flask) {
        returnSummaryItems.push({
          label: this._translateService.instant(PortalResources.flaskProjectName),
          value: buildSettings.pythonSettings.flaskProjectName,
        });
      }

      if (wizValues.buildSettings.pythonSettings.framework === PythonFrameworkType.Django) {
        returnSummaryItems.push({
          label: this._translateService.instant(PortalResources.djangoSettings),
          value: buildSettings.pythonSettings.djangoSettingsModule,
        });
      }
    }

    return returnSummaryItems;
  }

  private _sourceControlGroup(): SummaryGroup {
    const wizValues = this.wizard.wizardValues;
    const sourceProvider = wizValues.sourceProvider;
    const returnSummaryItems = [];
    if (sourceProvider === 'dropbox' || sourceProvider === 'onedrive') {
      returnSummaryItems.push({
        label: this._translateService.instant(PortalResources.folder),
        value: wizValues.sourceSettings.repoUrl,
      });
    }

    if (sourceProvider === 'github' || sourceProvider === 'bitbucket' || sourceProvider === 'external' || sourceProvider === 'vsts') {
      returnSummaryItems.push({
        label: this._translateService.instant(PortalResources.repository),
        value: wizValues.sourceSettings.repoUrl,
      });
      returnSummaryItems.push({
        label: this._translateService.instant(PortalResources.branch),
        value: wizValues.sourceSettings.branch || 'master',
      });
    }

    if (sourceProvider === 'localgit') {
      returnSummaryItems.push({
        label: this._translateService.instant(PortalResources.repository),
        value: this._translateService.instant(PortalResources.localGitRepoMessage),
      });
      returnSummaryItems.push({
        label: this._translateService.instant(PortalResources.branch),
        value: 'master',
      });
    }
    return {
      label: this._translateService.instant(PortalResources.sourceControl),
      items: returnSummaryItems,
    };
  }

  private _traceStepComplete() {
    const data = {
      resourceId: this.wizard.siteArm.id,
      sourceProvider: this.wizard.wizardValues.sourceProvider,
      sourceSettings: JSON.stringify(this.wizard.wizardValues.sourceSettings),
      buildProvider: this.wizard.wizardValues.buildProvider,
      buildSettings: JSON.stringify(this.wizard.wizardValues.buildSettings),
    };

    this._logService.trace(LogCategories.cicd, '/step-complete', data);
  }
}
