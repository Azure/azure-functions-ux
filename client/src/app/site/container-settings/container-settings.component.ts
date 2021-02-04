import { Component, OnDestroy, Input, Injector } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { ContainerSettingsInput, ContainerSettingsData, ContainerConfigureData, ContainerType } from './container-settings';
import { Observable } from 'rxjs/Observable';
import { ContainerSettingsManager } from './container-settings-manager';
import { LogCategories } from '../../shared/models/constants';
import { SiteService } from '../../shared/services/site.service';
import { HttpResult } from '../../shared/models/http-result';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { ApplicationSettings } from '../../shared/models/arm/application-settings';
import { SiteConfig } from '../../shared/models/arm/site-config';
import { PublishingCredentials } from '../../shared/models/publishing-credentials';
import { FormGroup, FormControl } from '@angular/forms';
import { LogService } from '../../shared/services/log.service';
import { errorIds } from '../../shared/models/error-ids';
import { ErrorEvent } from '../../shared/models/error-event';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { PortalService } from '../../shared/services/portal.service';
import { Subscription } from 'rxjs/Subscription';

export interface StatusMessage {
  message: string;
  level: 'error' | 'success';
}

@Component({
  selector: 'container-settings',
  templateUrl: './container-settings.component.html',
  styleUrls: ['./container-settings.component.scss'],
})
export class ContainerSettingsComponent extends FeatureComponent<TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>>
  implements OnDestroy {
  @Input()
  set viewInfoInput(viewInfo: TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>) {
    this.setInput(viewInfo);
    this._viewInfo = viewInfo;
  }

  public containerConfigureInfo: ContainerConfigureData;
  public applyButtonDisabled = false;
  public savevButtonDisabled = false;
  public discardButtonDisabled = false;
  public isUpdating = false;
  public isLocked = false;
  public fromMenu = false;
  public loading = true;
  public form: FormGroup;
  public statusMessage: StatusMessage;
  private _viewInfo: TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>;
  private _formStatusSubscription: Subscription;

  constructor(
    private _siteService: SiteService,
    private _logService: LogService,
    private _ts: TranslateService,
    private _portalService: PortalService,
    public containerSettingsManager: ContainerSettingsManager,
    injector: Injector
  ) {
    super('ContainerSettingsComponent', injector, 'dashboard');

    this.isParentComponent = true;
    this.featureName = 'ContainerSettings';
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.clearBusy();
    this._clearFormStatusSubscription();
    this._portalService.updateDirtyState(false);
  }

  protected setup(inputEvents: Observable<TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>>) {
    return inputEvents
      .concatMap(
        (r): Observable<any[]> => {
          this.containerConfigureInfo = { ...r.data.data, container: null, form: null, containerForm: null };
          this.fromMenu = !!this.containerConfigureInfo.fromMenu;
          this.containerSettingsManager.resetSettings(this.containerConfigureInfo);

          if (this.fromMenu) {
            return Observable.zip(
              this._siteService.getAppSettings(this.containerConfigureInfo.resourceId),
              this._siteService.getSiteConfig(this.containerConfigureInfo.resourceId),
              this._siteService.getPublishingCredentials(this.containerConfigureInfo.resourceId)
            );
          } else {
            return Observable.zip(Observable.of(r.data.data));
          }
        }
      )
      .do(r => {
        if (this.fromMenu) {
          const appSettingsResponse: HttpResult<ArmObj<ApplicationSettings>> = r[0];
          const siteConfigResponse: HttpResult<ArmObj<SiteConfig>> = r[1];
          const publishingCredentialsResponse: HttpResult<ArmObj<PublishingCredentials>> = r[2];

          if (appSettingsResponse.isSuccessful && siteConfigResponse.isSuccessful && publishingCredentialsResponse.isSuccessful) {
            this.containerSettingsManager.initializeForConfig(
              this.containerConfigureInfo.os,
              appSettingsResponse.result.properties,
              siteConfigResponse.result.properties,
              publishingCredentialsResponse.result.properties
            );
          } else {
            this._handleUnsuccessfulRespose(appSettingsResponse, siteConfigResponse, publishingCredentialsResponse);
          }
        } else {
          this.containerSettingsManager.initializeForCreate(this.containerConfigureInfo.os, this.containerConfigureInfo.containerFormData);
        }

        this.form = this.containerSettingsManager.form;
        this.containerConfigureInfo.form = this.form;

        this.containerConfigureInfo.container = this.containerSettingsManager.containers.find(
          c => c.id === this.form.controls.containerType.value
        );

        this.containerConfigureInfo.containerForm = this.containerSettingsManager.getContainerForm(
          this.form,
          this.containerConfigureInfo.container.id
        );

        this.loading = false;

        this._setupDirtyStateSubscription();
      });
  }

  public selectContainer(containerId: ContainerType) {
    this.containerConfigureInfo.containerForm = this.containerSettingsManager.getContainerForm(this.form, containerId);
    this.containerConfigureInfo.container = this.containerSettingsManager.containers.find(container => container.id === containerId);
  }

  public clickApply() {
    this.statusMessage = null;
    this._markFormGroupDirtyAndValidate(this.form);
    if (this.form.valid) {
      this.isUpdating = true;
      const data = this.containerSettingsManager.containerFormData;
      this.containerSettingsManager
        .applyContainerConfig(
          this.containerConfigureInfo.resourceId,
          this.containerConfigureInfo.location,
          this.containerConfigureInfo.os,
          data
        )
        .catch(error => {
          this.isUpdating = false;
          this.statusMessage = {
            level: 'error',
            message: error.message,
          };

          return Observable.of(false);
        })
        .subscribe(updateSuccess => {
          this.isUpdating = false;

          if (updateSuccess) {
            this.statusMessage = {
              level: 'success',
              message: this._ts.instant(PortalResources.containerSettingsUpdateSuccess),
            };
            this._portalService.returnPcv3Results<string>(JSON.stringify(data));
          }
        });
    } else {
      this.statusMessage = {
        level: 'error',
        message: this._ts.instant(PortalResources.formIsInvalid),
      };
    }
  }

  public clickSave() {
    this.statusMessage = null;
    this._markFormGroupDirtyAndValidate(this.form);
    if (this.form.valid) {
      const data = this.containerSettingsManager.containerFormData;
      this._portalService.updateDirtyState(true, this._ts.instant(PortalResources.clearDirtyConfirmation));
      this.isUpdating = true;

      this.containerSettingsManager
        .saveContainerConfig(
          this.containerConfigureInfo.resourceId,
          this.containerConfigureInfo.location,
          this.containerConfigureInfo.os,
          data
        )
        .catch(error => {
          this.isUpdating = false;
          this.statusMessage = {
            level: 'error',
            message: error.message,
          };

          return Observable.of(false);
        })
        .subscribe(updateSuccess => {
          this._portalService.updateDirtyState(!updateSuccess);
          this.isUpdating = false;

          if (updateSuccess) {
            this.statusMessage = {
              level: 'success',
              message: this._ts.instant(PortalResources.containerSettingsUpdateSuccess),
            };

            this.form.markAsPristine();
          }
        });
    } else {
      this.statusMessage = {
        level: 'error',
        message: this._ts.instant(PortalResources.errorsInContainerSettings),
      };
    }
  }

  public clickDiscard() {
    const proceed = confirm(this._ts.instant(PortalResources.unsavedChangesWarning));
    if (proceed) {
      this.setInput(this._viewInfo);
    }
  }

  public switchToNewExperience() {
    this._portalService.openFrameBlade(
      {
        detailBlade: 'DeploymentCenterFrameBladeReact',
        detailBladeInputs: {
          id: this.containerConfigureInfo.resourceId,
        },
      },
      'container-settings'
    );
  }

  private _markFormGroupDirtyAndValidate(formGroup: FormGroup) {
    if (formGroup.controls) {
      const keys = Object.keys(formGroup.controls);
      for (let i = 0; i < keys.length; i++) {
        const control = formGroup.controls[keys[i]];
        if (control.enabled) {
          if (control instanceof FormControl && !control.touched && !control.value) {
            control.markAsDirty();
            control.updateValueAndValidity();
          } else if (control instanceof FormGroup) {
            this._markFormGroupDirtyAndValidate(control);
          }
        }
      }
    }
  }

  private _handleUnsuccessfulRespose(
    appSettingsResponse: HttpResult<ArmObj<ApplicationSettings>>,
    siteConfigResponse: HttpResult<ArmObj<SiteConfig>>,
    publishingCredentialsResponse: HttpResult<ArmObj<PublishingCredentials>>
  ) {
    let noWritePermission = false;
    let hasReadOnlyLock = false;

    if (!appSettingsResponse.isSuccessful) {
      if (appSettingsResponse.error.errorId === errorIds.armErrors.noAccess) {
        noWritePermission = true;
      } else if (appSettingsResponse.error.errorId === errorIds.armErrors.scopeLocked) {
        hasReadOnlyLock = true;
      } else {
        this._logService.error(LogCategories.containerSettings, errorIds.failedToGetAppSettings, appSettingsResponse.error);
      }
    }

    if (!publishingCredentialsResponse.isSuccessful) {
      if (publishingCredentialsResponse.error.errorId === errorIds.armErrors.noAccess) {
        noWritePermission = true;
      } else if (publishingCredentialsResponse.error.errorId === errorIds.armErrors.scopeLocked) {
        hasReadOnlyLock = true;
      } else {
        this._logService.error(
          LogCategories.containerSettings,
          errorIds.failedToGetPublishingCredentials,
          publishingCredentialsResponse.error
        );
      }
    }

    if (!siteConfigResponse.isSuccessful) {
      this._logService.error(LogCategories.containerSettings, errorIds.failedToGetSiteConfig, siteConfigResponse.error);
    }

    if (noWritePermission) {
      this.statusMessage = {
        message: this._ts.instant(PortalResources.containerWriteAccessError),
        level: 'error',
      };
      this.isLocked = true;
      this.containerSettingsManager.intializeForLockedMode(this.containerConfigureInfo.os);
    } else if (hasReadOnlyLock) {
      this.statusMessage = {
        message: this._ts.instant(PortalResources.containerReadLockError),
        level: 'error',
      };
      this.isLocked = true;
      this.containerSettingsManager.intializeForLockedMode(this.containerConfigureInfo.os);
    } else {
      const error: ErrorEvent = {
        errorId: errorIds.failedToGetContainerConfigData,
        resourceId: this.containerConfigureInfo.resourceId,
        message: this._ts.instant(PortalResources.failedToGetContainerConfigData),
      };
      this.showComponentError(error);
    }
  }

  private _setupDirtyStateSubscription() {
    this._clearFormStatusSubscription();

    if (this.form) {
      this._formStatusSubscription = this.form.statusChanges.subscribe(status => {
        this._portalService.updateDirtyState(this.form.dirty);
      });
    }
  }

  private _clearFormStatusSubscription() {
    if (this._formStatusSubscription) {
      this._formStatusSubscription.unsubscribe();
      this._formStatusSubscription = null;
    }
  }
}
