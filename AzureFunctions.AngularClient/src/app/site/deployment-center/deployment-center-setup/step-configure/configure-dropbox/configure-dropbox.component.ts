import { Component } from '@angular/core';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { AiService } from 'app/shared/services/ai.service';
import { Constants, LogCategories } from 'app/shared/models/constants';
import { LogService } from 'app/shared/services/log.service';

@Component({
	selector: 'app-configure-dropbox',
	templateUrl: './configure-dropbox.component.html',
	styleUrls: ['./configure-dropbox.component.scss', '../step-configure.component.scss']
})
export class ConfigureDropboxComponent {
	private _resourceId: string;
	public folderList: DropDownElement<string>[];

	constructor(
		public wizard: DeploymentCenterWizardService,
		_portalService: PortalService,
		private _cacheService: CacheService,
		_armService: ArmService,
		_aiService: AiService,
		private _logService: LogService
	) {
		this.wizard.resourceIdStream.subscribe(r => {
			this._resourceId = r;
		});
		this.fillDropboxFolders();
	}

	public fillDropboxFolders() {
		this.folderList = [];
		return this._cacheService
			.post(Constants.serviceHost + 'api/dropbox/passthrough', true, null, {
				url: 'https://api.dropboxapi.com/2/files/list_folder',
				arg: {
					path: ''
				},
				content_type: 'application/json'
			})
			.subscribe(
				r => {
					const rawFolders = r.json();
					let options: DropDownElement<string>[] = [];
					const splitRID = this._resourceId.split('/');
					const siteName = splitRID[splitRID.length - 1];

					options.push({
						displayLabel: siteName,
						value: `https://www.dropbox.com/home/Apps/Azure/${siteName}`
					});

					rawFolders.entries.forEach(item => {
						if (siteName.toLowerCase() === item.name.toLowerCase() || item['.tag'] !== 'folder') {
						} else {
							options.push({
								displayLabel: item.name,
								value: `https://www.dropbox.com/home/Apps/Azure/${item.name}`
							});
						}
					});

					this.folderList = options;
					this.wizard.wizardForm.controls.sourceSettings.value.repoUrl = `https://www.dropbox.com/home/Apps/Azure/${siteName}`;
				},
				err => {
					this._logService.error(LogCategories.cicd, '/fetch-dropbox-folders', err);
				}
			);
	}
}
