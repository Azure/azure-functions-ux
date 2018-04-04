import { Component } from '@angular/core';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { AiService } from 'app/shared/services/ai.service';
import { Constants, LogCategories, DeploymentCenterConstants } from 'app/shared/models/constants';
import { LogService } from 'app/shared/services/log.service';
import { RequiredValidator } from '../../../../../shared/validators/requiredValidator';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-configure-dropbox',
    templateUrl: './configure-dropbox.component.html',
    styleUrls: ['./configure-dropbox.component.scss', '../step-configure.component.scss', '../../deployment-center-setup.component.scss']
})
export class ConfigureDropboxComponent {
    private _resourceId: string;
    public folderList: DropDownElement<string>[];

    selectedFolder = '';
    constructor(
        public wizard: DeploymentCenterStateManager,
        _portalService: PortalService,
        private _cacheService: CacheService,
        _armService: ArmService,
        _aiService: AiService,
        private _logService: LogService,
        private _translateService: TranslateService
    ) {
        this.wizard.resourceIdStream.subscribe(r => {
            this._resourceId = r;
        });
        this.fillDropboxFolders();
        this.updateFormValidation();
    }
    updateFormValidation() {
        const required = new RequiredValidator(this._translateService, false);
        this.wizard.sourceSettings.get('repoUrl').setValidators(required.validate.bind(required));
        this.wizard.sourceSettings.get('branch').setValidators([]);
        this.wizard.sourceSettings.get('isMercurial').setValidators([]);
        this.wizard.sourceSettings.get('repoUrl').updateValueAndValidity();
        this.wizard.sourceSettings.get('branch').updateValueAndValidity();
        this.wizard.sourceSettings.get('isMercurial').updateValueAndValidity();
    }
    public fillDropboxFolders() {
        this.folderList = [];
        return this._cacheService
            .post(Constants.serviceHost + 'api/dropbox/passthrough', true, null, {
                url: `${DeploymentCenterConstants.dropboxApiUrl}/files/list_folder`,
                arg: {
                    path: ''
                },
                content_type: 'application/json'
            })
            .subscribe(
                r => {
                    const rawFolders = r.json();
                    const options: DropDownElement<string>[] = [];
                    const splitRID = this._resourceId.split('/');
                    const siteName = splitRID[splitRID.length - 1];

                    options.push({
                        displayLabel: siteName,
                        value: `${DeploymentCenterConstants.dropboxUri}/${siteName}`
                    });

                    rawFolders.entries.forEach(item => {
                        if (siteName.toLowerCase() === item.name.toLowerCase() || item['.tag'] !== 'folder') {
                        } else {
                            options.push({
                                displayLabel: item.name,
                                value: `${DeploymentCenterConstants.dropboxUri}/${item.name}`
                            });
                        }
                    });

                    this.folderList = options;
                    const vals = this.wizard.wizardValues;
                    vals.sourceSettings.repoUrl = `${DeploymentCenterConstants.dropboxUri}/${siteName}`;
                    this.wizard.wizardValues = vals;
                },
                err => {
                    this._logService.error(LogCategories.cicd, '/fetch-dropbox-folders', err);
                }
            );
    }
}
