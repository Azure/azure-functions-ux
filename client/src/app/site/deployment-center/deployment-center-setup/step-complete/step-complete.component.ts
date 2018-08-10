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
    styleUrls: ['./step-complete.component.scss', '../deployment-center-setup.component.scss']
})
export class StepCompleteComponent {
    resourceId: string;
    private _busyManager: BusyStateScopeManager;
    private _ngUnsubscribe$ = new Subject();

    constructor(
        public wizard: DeploymentCenterStateManager,
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService,
        private _portalService: PortalService,
        private _logService: LogService
    ) {
        this._busyManager = new BusyStateScopeManager(_broadcastService, SiteTabIds.continuousDeployment);

        this.wizard.resourceIdStream$
            .takeUntil(this._ngUnsubscribe$)
            .subscribe(r => {
                this.resourceId = r;
            });
    }

    Save() {
        this._busyManager.setBusy();
        let notificationId = null;
        this._portalService
            .startNotification(this._translateService.instant(PortalResources.settingupDeployment), this._translateService.instant(PortalResources.settingupDeployment))
            .do(notification => {
                notificationId = notification.id;
            })
            .concatMap(() => this.wizard.deploy())
            .first()
            .subscribe(
                r => {
                    this.clearBusy();
                    this._portalService.stopNotification(notificationId, true, this._translateService.instant(PortalResources.settingupDeploymentSuccess));
                    this._broadcastService.broadcastEvent<void>(BroadcastEvent.ReloadDeploymentCenter);
                },
                err => {
                    this.clearBusy();
                    this._portalService.stopNotification(notificationId, true, this._translateService.instant(PortalResources.settingupDeploymentFail));
                    this._logService.error(LogCategories.cicd, '/save-cicd', err);
                }
            );
    }

    clearBusy() {
        this._busyManager.clearBusy();
    }

    get SummaryGroups(): SummaryGroup[] {
        const returnVal = [
            this._sourceControlGroup(),
            this._buildControlgroup()
        ];
        if (this.wizard.wizardValues.buildProvider === 'vsts') {
            returnVal.push(this._loadTestGroup());
            returnVal.push(this._slotDeploymentGroup());
        }
        return returnVal;
    }

    private _buildControlgroup(): SummaryGroup {
        const wizValues = this.wizard.wizardValues;
        const buildProvider = wizValues.buildProvider;
        const buildSettings = wizValues.buildSettings;
        const returnSummaryItems = [];
        if (buildProvider === 'kudu') {
            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.provider),
                value: this._translateService.instant(PortalResources.kuduTitle)
            });
        } else {
            const appFramework = wizValues.buildSettings.applicationFramework;

            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.provider),
                value: this._translateService.instant(PortalResources.vstsBuildServerTitle)
            });

            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.newAccount),
                value: buildSettings.createNewVsoAccount ?
                    this._translateService.instant(PortalResources.yes) :
                    this._translateService.instant(PortalResources.no)
            });

            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.account),
                value: buildSettings.vstsAccount
            });

            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.project),
                value: buildSettings.vstsProject
            });

            if (wizValues.buildSettings.createNewVsoAccount) {
                returnSummaryItems.push({
                    label: this._translateService.instant(PortalResources.location),
                    value: buildSettings.location
                });
            }

            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.webAppFramework),
                value: buildSettings.applicationFramework
            });

            if (appFramework !== 'AspNetWap' && appFramework !== 'AspNetCore' && !!buildSettings.workingDirectory) {
                returnSummaryItems.push({
                    label: this._translateService.instant(PortalResources.workingDirectory),
                    value: buildSettings.workingDirectory
                });
            }

            if (appFramework === 'Node') {
                returnSummaryItems.push({
                    label: this._translateService.instant(PortalResources.taskRunner),
                    value: buildSettings.nodejsTaskRunner
                });
            }

            if (appFramework === 'Python') {
                returnSummaryItems.push({
                    label: this._translateService.instant(PortalResources.pythonVersionLabel),
                    value: buildSettings.pythonSettings.version
                });

                returnSummaryItems.push({
                    label: this._translateService.instant(PortalResources.pythonVersionLabel),
                    value: buildSettings.pythonSettings.framework
                });

                if (wizValues.buildSettings.pythonSettings.framework === 'Flask') {
                    returnSummaryItems.push({
                        label: this._translateService.instant(PortalResources.flaskProjectName),
                        value: buildSettings.pythonSettings.flaskProjectName
                    });
                }

                if (wizValues.buildSettings.pythonSettings.framework === 'Django') {
                    returnSummaryItems.push({
                        label: this._translateService.instant(PortalResources.djangoSettings),
                        value: buildSettings.pythonSettings.djangoSettingsModule
                    });
                }
            }
        }
        return {
            label: this._translateService.instant(PortalResources.buildProvider),
            items: returnSummaryItems
        };
    }

    private _loadTestGroup() {
        const wizValues = this.wizard.wizardValues;
        const testSettings = wizValues.testEnvironment;
        const returnSummaryItems = [];
        returnSummaryItems.push({
            label: this._translateService.instant(PortalResources.enabled),
            value: testSettings.enabled ?
                this._translateService.instant(PortalResources.yes)
                : this._translateService.instant(PortalResources.no)
        });
        if (testSettings.enabled) {
            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.appServicePlan),
                value: testSettings.appServicePlanId
            });
            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.webApp),
                value: testSettings.webAppId
            });
        }
        return {
            label: this._translateService.instant(PortalResources.test),
            items: returnSummaryItems
        };
    }

    private _slotDeploymentGroup() {
        const wizValues = this.wizard.wizardValues;
        const deployValues = wizValues.deploymentSlotSetting;
        const returnSummaryItems = [];
        returnSummaryItems.push({
            label: this._translateService.instant(PortalResources.enabled),
            value: deployValues.deploymentSlotEnabled ?
                this._translateService.instant(PortalResources.yes)
                : this._translateService.instant(PortalResources.no)
        });
        if (deployValues.deploymentSlotEnabled) {
            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.newDeploymentSlot),
                value: deployValues.newDeploymentSlot ?
                    this._translateService.instant(PortalResources.yes)
                    : this._translateService.instant(PortalResources.no)
            });
            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.deploymentSlotName),
                value: deployValues.deploymentSlot
            });
        }
        return {
            label: this._translateService.instant(PortalResources.deploy),
            items: returnSummaryItems
        };
    }
    private _sourceControlGroup(): SummaryGroup {
        const wizValues = this.wizard.wizardValues;
        const sourceProvider = wizValues.sourceProvider;
        const returnSummaryItems = [];
        if (sourceProvider === 'dropbox' || sourceProvider === 'onedrive') {
            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.folder),
                value: wizValues.sourceSettings.repoUrl
            });
        }

        if (sourceProvider === 'github' || sourceProvider === 'bitbucket' || sourceProvider === 'external' || sourceProvider === 'vsts') {
            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.repository),
                value: wizValues.sourceSettings.repoUrl
            });
            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.branch),
                value: wizValues.sourceSettings.branch || 'master'
            });
        }

        if (sourceProvider === 'localgit') {
            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.repository),
                value: this._translateService.instant(PortalResources.localGitRepoMessage)
            });
            returnSummaryItems.push({
                label: this._translateService.instant(PortalResources.branch),
                value: 'master'
            });
        }
        return {
            label: this._translateService.instant(PortalResources.sourceControl),
            items: returnSummaryItems
        };
    }
}
