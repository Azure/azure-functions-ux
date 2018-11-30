import { Component, OnChanges, OnDestroy, Input, Injector, SimpleChanges } from '@angular/core';
import { ConfigSaveComponent, ArmSaveConfigs } from 'app/shared/components/config-save-component';
import { FormGroup, FormArray } from '@angular/forms';
import { ResourceId, ArmObj } from 'app/shared/models/arm/arm-obj';
import { SiteTabIds } from 'app/shared/models/constants';
import { Observable } from 'rxjs/Observable';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { PortalService } from 'app/shared/services/portal.service';
import { Site } from 'app/shared/models/arm/site';
import { SiteService } from 'app/shared/services/site.service';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { OsType } from 'app/shared/models/arm/stacks';
import { EventMessage, BroadcastEvent } from 'app/shared/models/broadcast-event';
import { ByosData } from 'app/site/byos/byos';
import { PortalResources } from 'app/shared/models/portal-resources';
import { AuthzService } from 'app/shared/services/authz.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomFormGroup } from 'app/controls/click-to-edit/click-to-edit.component';
import { SelectOption } from 'app/shared/models/select-option';

// TODO(michinoy): Will send a separate PR with these changes.

@Component({
  selector: 'mount-storage',
  templateUrl: './mount-storage.component.html',
  styleUrls: ['./../site-config.component.scss'],
})
export class MountStorageComponent extends ConfigSaveComponent implements OnChanges, OnDestroy {
  @Input()
  mainForm: FormGroup;
  @Input()
  resourceId: ResourceId;

  private _site: ArmObj<Site>;
  public enableAddItemLink: boolean;

  public Resources = PortalResources;
  public groupArray: FormArray;
  public hasWritePermissions: boolean;
  public permissionsMessage: string;
  public showPermissionsMessage: boolean;
  public showReadOnlySettingsMessage: string;
  public loadingFailureMessage: string;
  public loadingMessage: string;
  public newItem: CustomFormGroup;
  public originalItemsDeleted: number;
  public showValues: boolean;
  public showValuesOptions: SelectOption<boolean>[];

  constructor(
    private _portalService: PortalService,
    private _siteService: SiteService,
    private _authZService: AuthzService,
    private _translateService: TranslateService,
    injector: Injector
  ) {
    super('MountStorageComponent', injector, ['SiteConfig'], SiteTabIds.applicationSettings);
    this._setupByosConfigSubscription();

    this._resetPermissionsAndLoadingState();

    this.newItem = null;
    this.originalItemsDeleted = 0;

    this.showValuesOptions = [
      { displayLabel: this._translateService.instant(PortalResources.hideValues), value: false },
      { displayLabel: this._translateService.instant(PortalResources.showValues), value: true },
    ];
  }

  protected get _isPristine() {
    return this.groupArray && this.groupArray.pristine;
  }

  protected setup(inputEvents: Observable<ResourceId>) {
    return inputEvents
      .switchMap(resourceId => {
        this._saveFailed = false;
        this._resetSubmittedStates();
        this._resetConfigs();
        this.groupArray = null;
        this.newItem = null;
        this.originalItemsDeleted = 0;
        this._resetPermissionsAndLoadingState();

        return Observable.zip(
          this._siteService.getSite(resourceId),
          this._siteService.getSiteConfig(resourceId),
          this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(this.resourceId)
        );
      })
      .do(tuple => {
        const [siteResponse, siteConfigResponse, permissionResponse, readOnlyLockResponse] = tuple;
        this._setPermissions(permissionResponse, readOnlyLockResponse);
        this._site = siteResponse.result;

        this.loadingMessage = null;
        this.showPermissionsMessage = true;
      });
  }

  protected _getConfigsFromForms(saveConfigs: ArmSaveConfigs): ArmSaveConfigs {
    // TODO(michinoy): implement this form.
    throw new Error('_getConfigsFromForms not implemented.');
  }

  public ngOnChanges(changes: SimpleChanges) {
    // TODO(michinoy): implement handling of changes.
    if (changes['resourceId']) {
      this.setInput(this.resourceId);
    }
  }

  public addItem() {
    const descriptor: ArmSiteDescriptor = new ArmSiteDescriptor(this._site.id);
    this._portalService.openBlade(
      {
        detailBlade: 'ByosPickerFrameBlade',
        detailBladeInputs: {
          id: this._site.id,
          data: {
            resourceId: this._site.id,
            isFunctionApp: false,
            subscriptionId: descriptor.subscription,
            location: this._site.location,
            os: ArmUtil.isLinuxApp(this._site) ? OsType.Linux : OsType.Windows,
          },
        },
      },
      'site-config'
    );
  }

  public validate() {}

  public updateShowValues(showValues: boolean) {
    this.showValues = showValues;
  }

  private _setupByosConfigSubscription() {
    this._broadcastService
      .getEvents<EventMessage<ByosData>>(BroadcastEvent.ByosConfigReceived)
      .filter(m => {
        return m.resourceId.toLowerCase() === this.resourceId.toLowerCase();
      })
      .subscribe(message => {
        const byosConfig = message.metadata;
        console.log(byosConfig); // Leaving this in place to avoid compile errors.
      });
  }

  private _setPermissions(writePermission: boolean, readOnlyLock: boolean) {
    if (!writePermission) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configRequiresWritePermissionOnApp);
    } else if (readOnlyLock) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configDisabledReadOnlyLockOnApp);
    } else {
      this.permissionsMessage = '';
    }

    this.hasWritePermissions = writePermission && !readOnlyLock;
    this.enableAddItemLink = this.hasWritePermissions;
  }

  private _resetPermissionsAndLoadingState() {
    this.hasWritePermissions = true;
    this.permissionsMessage = '';
    this.showPermissionsMessage = false;
    this.showReadOnlySettingsMessage = this._translateService.instant(PortalResources.configViewReadOnlySettings);
    this.loadingFailureMessage = '';
    this.loadingMessage = this._translateService.instant(PortalResources.loading);
    this.enableAddItemLink = false;
  }
}
