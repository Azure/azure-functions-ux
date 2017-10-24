import { Component } from '@angular/core';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { AiService } from 'app/shared/services/ai.service';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { Constants } from 'app/shared/models/constants';
import { MovingDirection } from 'app/controls/form-wizard/util/moving-direction.enum';
import { KuduBuildSettings } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-setup-models';

@Component({
    selector: 'app-configure-onedrive',
    templateUrl: './configure-onedrive.component.html',
    styleUrls: ['./configure-onedrive.component.scss', '../step-configure.component.scss']
})
export class ConfigureOnedriveComponent {
    private _resourceId: string;
    public folderList: DropDownElement<string>[];
    private _chosenFolder: string;

    constructor(
        private _wizard: DeploymentCenterWizardService,
        _portalService: PortalService,
        private _cacheService: CacheService,
        _armService: ArmService,
        _aiService: AiService
    ) {
        this._wizard.sourceControlProvider$.subscribe(provider => {
            this.fillOnedriveFolders();
        });
        this._wizard.resourceIdStream.subscribe(r => {
            this._resourceId = r;
        });
        this._wizard.StepExitListener.subscribe(r => {
            if (r.step !== 'configure' || r.direction !== MovingDirection.Forwards) {
                return;
            }

            const buildSettings: KuduBuildSettings = {
                repoUrl: this._chosenFolder,
                branch: '',
                isManualIntegration: false,
                deploymentRollbackEnabled: false,
                isMercurial: false
            };
            this._wizard.currentWizardState.buildSettings = buildSettings;
        });
    }

    folderChanged(value) {
        this._chosenFolder = value;
    }
    public fillOnedriveFolders() {
        this.folderList = [];
        return this._cacheService
            .post(Constants.serviceHost + 'api/onedrive/passthrough', true, null, {
                url: 'https://api.onedrive.com/v1.0/drive/special/approot/children'
            })
            .subscribe(r => {
                const rawFolders = r.json();
                let options: DropDownElement<string>[] = [];
                const splitRID = this._resourceId.split('/');
                const siteName = splitRID[splitRID.length - 1];

                options.push({
                    displayLabel: siteName,
                    value: `https://api.onedrive.com/v1.0/drive/special/approot:/${siteName}`
                });

                rawFolders.value.forEach(item => {
                    if (siteName.toLowerCase() === item.name.toLowerCase()) {
                    } else {
                        options.push({
                            displayLabel: item.name,
                            value: item.repoUrl
                        });
                    }
                });
                this.folderList = options;
            });
    }
}
