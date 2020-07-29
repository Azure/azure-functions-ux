import { Component } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { Constants, LogCategories, DeploymentCenterConstants } from 'app/shared/models/constants';
import { Subject } from 'rxjs/Subject';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { LogService } from 'app/shared/services/log.service';
import { TranslateService } from '@ngx-translate/core';
import { RequiredValidator } from '../../../../../shared/validators/requiredValidator';
import { of } from 'rxjs/observable/of';

@Component({
  selector: 'app-configure-onedrive',
  templateUrl: './configure-onedrive.component.html',
  styleUrls: ['./configure-onedrive.component.scss', '../step-configure.component.scss', '../../deployment-center-setup.component.scss'],
})
export class ConfigureOnedriveComponent implements OnDestroy {
  private _resourceId: string;
  public folderList: DropDownElement<string>[];
  private _ngUnsubscribe$ = new Subject();
  private _onedriveCallSubject$ = new Subject();

  public foldersLoading = false;
  constructor(
    public wizard: DeploymentCenterStateManager,
    _portalService: PortalService,
    private _cacheService: CacheService,
    _armService: ArmService,
    private _logService: LogService,
    private _translateService: TranslateService
  ) {
    this.wizard.wizardForm.controls.sourceSettings.value.isManualIntegration = false;
    this.wizard.resourceIdStream$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
      this._resourceId = r;
    });
    this._onedriveCallSubject$
      .takeUntil(this._ngUnsubscribe$)
      .switchMap(() =>
        this._cacheService
          .post(Constants.serviceHost + 'api/onedrive/passthrough', true, null, {
            url: `${DeploymentCenterConstants.onedriveApiUri}/children`,
            oneDriveToken: this.wizard.oneDriveToken,
          })
          .catch(err => {
            this._logService.error(LogCategories.cicd, '/fetch-onedrive-folders', err);
            return of({ value: [] });
          })
      )
      .subscribe(
        r => {
          this.foldersLoading = false;
          const rawFolders = r.json();
          const options: DropDownElement<string>[] = [];
          const splitRID = this._resourceId.split('/');
          const siteName = splitRID[splitRID.length - 1];

          options.push({
            displayLabel: siteName,
            value: `${DeploymentCenterConstants.onedriveApiUri}:/${siteName}`,
          });

          rawFolders.value.forEach(item => {
            if (siteName.toLowerCase() === item.name.toLowerCase()) {
            } else {
              options.push({
                displayLabel: item.name,
                value: `${DeploymentCenterConstants.onedriveApiUri}:/${item.name}`,
              });
            }
          });

          this.folderList = options;
          const vals = this.wizard.wizardValues;
          vals.sourceSettings.repoUrl = `${DeploymentCenterConstants.onedriveApiUri}:/${siteName}`;
          this.wizard.wizardValues = vals;
        },
        err => {
          this.foldersLoading = false;
          this._logService.error(LogCategories.cicd, '/fetch-onedrive-folders', err);
        }
      );
    this.updateFormValidation();
    this.fillOnedriveFolders();
    // if auth changes then this will force refresh the config data
    this.wizard.updateSourceProviderConfig$.takeUntil(this._ngUnsubscribe$).subscribe(r => {
      this.fillOnedriveFolders();
    });
  }
  updateFormValidation() {
    const required = new RequiredValidator(this._translateService, false);
    this.wizard.sourceSettings.get('repoUrl').setValidators(required.validate.bind(required));
    this.wizard.sourceSettings.get('branch').setValidators([]);
    this.wizard.sourceSettings.get('repoUrl').updateValueAndValidity();
    this.wizard.sourceSettings.get('branch').updateValueAndValidity();
  }

  public fillOnedriveFolders() {
    this.folderList = [];
    this.foldersLoading = true;
    this._onedriveCallSubject$.next();
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }
}
