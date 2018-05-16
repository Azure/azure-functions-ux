import { Component } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BusyStateScopeManager } from 'app/busy-state/busy-state-scope-manager';
import { Subject } from 'rxjs/Subject';
import { LogService } from 'app/shared/services/log.service';
import { LogCategories, SiteTabIds } from 'app/shared/models/constants';
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
        this.wizard.deploy().first().subscribe(
            r => {
                this.clearBusy();
                this._broadcastService.broadcastEvent<void>(BroadcastEvent.ReloadDeploymentCenter);
            },
            err => {
                this.clearBusy();
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
                label: 'Provider',
                value: 'App Service Kudu'
            });
        } else {
            const appFramework = wizValues.buildSettings.applicationFramework;

            returnSummaryItems.push({
                label: 'Provider',
                value: 'VSTS'
            });

            returnSummaryItems.push({
                label: 'New Account',
                value: buildSettings.createNewVsoAccount ? 'YES' : 'NO'
            });

            returnSummaryItems.push({
                label: 'Account',
                value: buildSettings.vstsAccount
            });

            returnSummaryItems.push({
                label: 'Project',
                value: buildSettings.vstsProject
            });

            if (wizValues.buildSettings.createNewVsoAccount) {
                returnSummaryItems.push({
                    label: 'Location',
                    value: buildSettings.location
                });
            }

            returnSummaryItems.push({
                label: 'Application Framework',
                value: buildSettings.applicationFramework
            });

            if (appFramework !== 'AspNetWap' && appFramework !== 'AspNetCore' && !!buildSettings.workingDirectory) {
                returnSummaryItems.push({
                    label: 'Worker Directory',
                    value: buildSettings.workingDirectory
                });
            }

            if (appFramework === 'Node') {
                returnSummaryItems.push({
                    label: 'NodeJS Task Runner',
                    value: buildSettings.nodejsTaskRunner
                });
            }

            if (appFramework === 'Python') {
                returnSummaryItems.push({
                    label: 'Python Version',
                    value: buildSettings.pythonSettings.version
                });

                returnSummaryItems.push({
                    label: 'Python Framework',
                    value: buildSettings.pythonSettings.framework
                });

                if (wizValues.buildSettings.pythonSettings.framework === 'Flask') {
                    returnSummaryItems.push({
                        label: 'Flask Project',
                        value: buildSettings.pythonSettings.flaskProjectName
                    });
                }

                if (wizValues.buildSettings.pythonSettings.framework === 'Django') {
                    returnSummaryItems.push({
                        label: 'Django Settings Module',
                        value: buildSettings.pythonSettings.djangoSettingsModule
                    });
                }
            }
        }
        return {
            label: 'Build Provider',
            items: returnSummaryItems
        };
    }

    private _loadTestGroup() {
        const wizValues = this.wizard.wizardValues;
        const testSettings = wizValues.testEnvironment;
        const returnSummaryItems = [];
        returnSummaryItems.push({
            label: 'Enabled',
            value: testSettings.enabled ? 'YES' : 'NO'
        });
        if (testSettings.enabled) {
            returnSummaryItems.push({
                label: 'App Service Plan',
                value: testSettings.appServicePlanId
            });
            returnSummaryItems.push({
                label: 'Web App',
                value: testSettings.webAppId
            });
        }
        return {
            label: 'Test',
            items: returnSummaryItems
        };
    }

    private _slotDeploymentGroup() {
        const wizValues = this.wizard.wizardValues;
        const deployValues = wizValues.deploymentSlotSetting;
        const returnSummaryItems = [];
        returnSummaryItems.push({
            label: 'Enabled',
            value: deployValues.deploymentSlotEnabled ? 'YES' : 'NO'
        });
        if (deployValues.deploymentSlotEnabled) {
            returnSummaryItems.push({
                label: 'New Deployment Slot',
                value: deployValues.newDeploymentSlot ? 'YES' : 'NO'
            });
            returnSummaryItems.push({
                label: 'Deployment Slot Name',
                value: deployValues.deploymentSlot
            });
        }
        return {
            label: 'Deploy',
            items: returnSummaryItems
        };
    }
    private _sourceControlGroup(): SummaryGroup {
        const wizValues = this.wizard.wizardValues;
        const sourceProvider = wizValues.sourceProvider;
        const returnSummaryItems = [];
        if (sourceProvider === 'dropbox' || sourceProvider === 'onedrive') {
            returnSummaryItems.push({
                label: 'Folder',
                value: wizValues.sourceSettings.repoUrl
            });
        }

        if (sourceProvider === 'github' || sourceProvider === 'bitbucket' || sourceProvider === 'external' || sourceProvider === 'vsts') {
            returnSummaryItems.push({
                label: 'Repository',
                value: wizValues.sourceSettings.repoUrl
            });
            returnSummaryItems.push({
                label: 'Branch',
                value: wizValues.sourceSettings.branch || 'master'
            });
        }

        if (sourceProvider === 'localgit') {
            returnSummaryItems.push({
                label: 'Repository',
                value: 'Your local git repository url will be generated upon completion'
            });
            returnSummaryItems.push({
                label: 'Branch',
                value: 'master'
            });
        }
        return {
            label: 'Source Control',
            items: returnSummaryItems
        };
    }
}
