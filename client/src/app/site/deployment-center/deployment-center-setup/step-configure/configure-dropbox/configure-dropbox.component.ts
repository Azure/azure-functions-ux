import { Component, OnInit, OnDestroy } from '@angular/core';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { CacheService } from 'app/shared/services/cache.service';
import { Constants, LogCategories, DeploymentCenterConstants } from 'app/shared/models/constants';
import { LogService } from 'app/shared/services/log.service';
import { RequiredValidator } from '../../../../../shared/validators/requiredValidator';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-configure-dropbox',
  templateUrl: './configure-dropbox.component.html',
  styleUrls: ['./configure-dropbox.component.scss', '../step-configure.component.scss', '../../deployment-center-setup.component.scss'],
})
export class ConfigureDropboxComponent implements OnInit, OnDestroy {
  private _resourceId: string;
  public folderList: DropDownElement<string>[] = [];
  private _ngUnsubscribe$ = new Subject();
  selectedFolder = '';

  public foldersLoading = false;
  constructor(
    public wizard: DeploymentCenterStateManager,
    private _cacheService: CacheService,
    private _logService: LogService,
    private _translateService: TranslateService
  ) {
    this.wizard.resourceIdStream$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
      this._resourceId = r;
      this.fillDropboxFolders();
    });

    // if auth changes then this will force refresh the config data
    this.wizard.updateSourceProviderConfig$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
      this.fillDropboxFolders();
    });
  }

  ngOnInit() {
    this.updateFormValidation();
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }

  updateFormValidation() {
    const required = new RequiredValidator(this._translateService, false);
    this.wizard.sourceSettings.get('repoUrl').setValidators(required.validate.bind(required));
    this.wizard.sourceSettings.get('branch').setValidators([]);
    this.wizard.sourceSettings.get('repoUrl').updateValueAndValidity();
    this.wizard.sourceSettings.get('branch').updateValueAndValidity();
  }

  public fillDropboxFolders() {
    this.foldersLoading = true;
    this.folderList = [];
    return this._cacheService
      .post(Constants.serviceHost + 'api/dropbox/passthrough', true, null, {
        url: `${DeploymentCenterConstants.dropboxApiUrl}/files/list_folder`,
        dropBoxToken: this.wizard.wizardValues.sourceSettings.dropBoxToken,
        arg: {
          path: '',
        },
        content_type: 'application/json',
      })
      .subscribe(
        r => {
          this.foldersLoading = false;
          const rawFolders = r.json();
          const options: DropDownElement<string>[] = [];
          const splitRID = this._resourceId.split('/');
          const siteName = splitRID[splitRID.length - 1];

          options.push({
            displayLabel: siteName,
            value: `${DeploymentCenterConstants.dropboxUri}/${siteName}`,
          });

          rawFolders.entries.forEach(item => {
            if (siteName.toLowerCase() === item.name.toLowerCase() || item['.tag'] !== 'folder') {
            } else {
              options.push({
                displayLabel: item.name,
                value: `${DeploymentCenterConstants.dropboxUri}/${item.name}`,
              });
            }
          });

          this.folderList = options;
          this.selectedFolder = `${DeploymentCenterConstants.dropboxUri}/${siteName}`;
        },
        err => {
          this.foldersLoading = false;
          this._logService.error(LogCategories.cicd, '/fetch-dropbox-folders', err);
        }
      );
  }
}
