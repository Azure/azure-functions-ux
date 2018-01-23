import { LogCategories } from './../../../shared/models/constants';
import { Response } from '@angular/http';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { Site } from './../../../shared/models/arm/site';
import { SlotConfigNames } from './../../../shared/models/arm/slot-config-names';
import { SaveOrValidationResult } from './../site-config.component';
import { LogService } from './../../../shared/services/log.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj, ArmObjMap } from './../../../shared/models/arm/arm-obj';
import { CacheService } from './../../../shared/services/cache.service';
import { AuthzService } from './../../../shared/services/authz.service';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { LinuxAppSettingNameValidator } from 'app/shared/validators/linuxAppSettingNameValidator';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';

import { ConfigTableBaseComponent }  from '../config-table-base-component';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./../site-config.component.scss']
})
export class AppSettingsComponent extends ConfigTableBaseComponent implements OnChanges, OnDestroy {
  public Resources = PortalResources;

  private _resourceIdStream: Subject<string>;
  private _resourceIdSubscription: RxSubscription;
  public hasWritePermissions: boolean;
  public permissionsMessage: string;
  public showPermissionsMessage: boolean;

  private _busyManager: BusyStateScopeManager;

  private _saveError: string;

  private _validatorFns: ValidatorFn[];
  private _requiredValidator: RequiredValidator;
  private _uniqueAppSettingValidator: UniqueValidator;
  private _linuxAppSettingNameValidator: LinuxAppSettingNameValidator;
  private _isLinux: boolean;

  private _appSettingsArm: ArmObj<any>;
  private _slotConfigNamesArm: ArmObj<SlotConfigNames>;

  public loadingFailureMessage: string;
  public loadingMessage: string;

  @Input() mainForm: FormGroup;

  @Input() resourceId: string;
  private _slotConfigNamesArmPath: string;

  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _logService: LogService,
    private _authZService: AuthzService,
    broadcastService: BroadcastService
  ) {
    super();

    this._busyManager = new BusyStateScopeManager(broadcastService, 'site-tabs');

    this._resetPermissionsAndLoadingState();

    this._resourceIdStream = new Subject<string>();
    this._resourceIdSubscription = this._resourceIdStream
      .distinctUntilChanged()
      .switchMap(() => {
        this._busyManager.setBusy();
        this._saveError = null;
        this._appSettingsArm = null;
        this._slotConfigNamesArm = null;
        this.groupArray = null;
        this._resetNewAndDeleted();
        this._resetPermissionsAndLoadingState();
        this._slotConfigNamesArmPath =
          `${new ArmSiteDescriptor(this.resourceId).getSiteOnlyResourceId()}/config/slotConfigNames`;
        return Observable.zip(
          this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(this.resourceId),
          (wp, rl) => ({ writePermission: wp, readOnlyLock: rl })
        )
      })
      .mergeMap(p => {
        this._setPermissions(p.writePermission, p.readOnlyLock);
        return Observable.zip(
          Observable.of(this.hasWritePermissions),
          this._cacheService.getArm(this.resourceId),
          this.hasWritePermissions ?
            this._cacheService.postArm(`${this.resourceId}/config/appSettings/list`, true) : Observable.of(null),
          this.hasWritePermissions ?
            this._cacheService.getArm(this._slotConfigNamesArmPath, true) : Observable.of(null),
          (h, s, a, scn) => ({ hasWritePermissions: h, siteConfigResponse: s, appSettingsResponse: a, slotConfigNamesResponse: scn })
        );
      })
      .do(null, error => {
        this._logService.error(LogCategories.appSettings, '/app-settings', error);
        this._setupForm(null, null);
        this.loadingFailureMessage = this._translateService.instant(PortalResources.configLoadFailure);
        this.loadingMessage = null;
        this.showPermissionsMessage = true;
        this._busyManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        if (r.hasWritePermissions) {
          const siteConfigArm: ArmObj<Site> = r.siteConfigResponse.json();
          this._isLinux = ArmUtil.isLinuxApp(siteConfigArm);
          this._appSettingsArm = r.appSettingsResponse.json();
          this._slotConfigNamesArm = r.slotConfigNamesResponse.json();
          this._setupForm(this._appSettingsArm, this._slotConfigNamesArm);
        }
        this.loadingMessage = null;
        this.showPermissionsMessage = true;
        this._busyManager.clearBusy();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resourceId']) {
      this._resourceIdStream.next(this.resourceId);
    }
    if (changes['mainForm'] && !changes['resourceId']) {
      this._setupForm(this._appSettingsArm, this._slotConfigNamesArm);
    }
  }

  ngOnDestroy(): void {
    if (this._resourceIdSubscription) {
      this._resourceIdSubscription.unsubscribe();
      this._resourceIdSubscription = null;
    }
    this._busyManager.clearBusy();
  }

  private _resetPermissionsAndLoadingState() {
    this.hasWritePermissions = true;
    this.permissionsMessage = '';
    this.showPermissionsMessage = false;
    this.loadingFailureMessage = '';
    this.loadingMessage = this._translateService.instant(PortalResources.loading);
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
  }


  private _setupForm(appSettingsArm: ArmObj<any>, slotConfigNamesArm: ArmObj<SlotConfigNames>) {
    if (!!appSettingsArm && !!slotConfigNamesArm) {
      if (!this._saveError || !this.groupArray) {
        this._resetNewAndDeleted();
        this.groupArray = this._fb.array([]);

        this._requiredValidator = new RequiredValidator(this._translateService);
        this._uniqueAppSettingValidator = new UniqueValidator(
          'name',
          this.groupArray,
          this._translateService.instant(PortalResources.validation_duplicateError));

        this._validatorFns = [
          this._requiredValidator.validate.bind(this._requiredValidator),
          this._uniqueAppSettingValidator.validate.bind(this._uniqueAppSettingValidator)
        ];

        if (this._isLinux) {
          this._linuxAppSettingNameValidator = new LinuxAppSettingNameValidator(this._translateService);
          this._validatorFns.push(
            this._linuxAppSettingNameValidator.validate.bind(this._linuxAppSettingNameValidator)
          );
        }

        const stickyAppSettingNames = slotConfigNamesArm.properties.appSettingNames || [];

        for (const name in appSettingsArm.properties) {

          if (appSettingsArm.properties.hasOwnProperty(name)) {
            const group = this._fb.group({
              name: [
                { value: name, disabled: !this.hasWritePermissions },
                Validators.compose(this._validatorFns)],
              value: [{ value: appSettingsArm.properties[name], disabled: !this.hasWritePermissions }],
              isSlotSetting: [{ value: stickyAppSettingNames.indexOf(name) !== -1, disabled: !this.hasWritePermissions }]
            }) as CustomFormGroup;

            group.msExistenceState = 'original';
            this.groupArray.push(group);
          }
        }

        this._validateAllControls();
      }

      if (this.mainForm.contains('appSettings')) {
        this.mainForm.setControl('appSettings', this.groupArray);
      } else {
        this.mainForm.addControl('appSettings', this.groupArray);
      }
    } else {
      this._resetNewAndDeleted();
      this.groupArray = null;
      if (this.mainForm.contains('appSettings')) {
        this.mainForm.removeControl('appSettings');
      }
    }

    this._saveError = null;
  }

  validate(): SaveOrValidationResult {
    this._purgePristineNewItems();

    this._validateAllControls();

    return {
      success: this.groupArray.valid,
      error: this.groupArray.valid ? null : this._validationFailureMessage()
    };
  }

  getConfigForSave(): ArmObjMap {
    // Prevent unnecessary PUT call if these settings haven't been changed
    if (this.groupArray.pristine) {
      return null;
    } else {
      const configObjects: ArmObjMap = {
        objects: {}
      };

      const appSettingGroups = this.groupArray.controls;

      if (this.mainForm.contains('appSettings') && this.mainForm.controls['appSettings'].valid) {
        const appSettingsArm: ArmObj<any> = JSON.parse(JSON.stringify(this._appSettingsArm));
        appSettingsArm.properties = {};

        this._slotConfigNamesArm.id = this._slotConfigNamesArmPath;
        const slotConfigNamesArm: ArmObj<any> = JSON.parse(JSON.stringify(this._slotConfigNamesArm));
        slotConfigNamesArm.properties.appSettingNames = slotConfigNamesArm.properties.appSettingNames || [];
        const appSettingNames = slotConfigNamesArm.properties.appSettingNames as string[];

        for (let i = 0; i < appSettingGroups.length; i++) {
          if ((appSettingGroups[i] as CustomFormGroup).msExistenceState !== 'deleted') {
            const name = appSettingGroups[i].value.name;

            appSettingsArm.properties[name] = appSettingGroups[i].value.value;

            if (appSettingGroups[i].value.isSlotSetting) {
              if (appSettingNames.indexOf(name) === -1) {
                appSettingNames.push(name);
              }
            } else {
              const index = appSettingNames.indexOf(name);
              if (index !== -1) {
                appSettingNames.splice(index, 1);
              }
            }
          }
        }

        configObjects['slotConfigNames'] = slotConfigNamesArm;
        configObjects['appSettings'] = appSettingsArm;
      } else {
        configObjects.error = this._validationFailureMessage();
      }

      return configObjects;
    }
  }

  save(
    appSettingsArm: ArmObj<any>,
    slotConfigNamesResponse: Response): Observable<SaveOrValidationResult> {

    // Don't make unnecessary PUT call if these settings haven't been changed
    if (this.groupArray.pristine) {
      return Observable.of({
        success: true,
        error: null
      });
    } else {
      return Observable.zip(
        this._cacheService.putArm(`${this.resourceId}/config/appSettings`, null, appSettingsArm),
        Observable.of(slotConfigNamesResponse),
        (a, s) => ({ appSettingsResponse: a, slotConfigNamesResponse: s })
      )
        .map(r => {
          this._appSettingsArm = r.appSettingsResponse.json();
          this._slotConfigNamesArm = r.slotConfigNamesResponse.json();
          return {
            success: true,
            error: null
          };
        })
        .catch(error => {
          this._saveError = error._body;
          return Observable.of({
            success: false,
            error: error._body
          });
        });
    }
  }

  private _validationFailureMessage(): string {
    const configGroupName = this._translateService.instant(PortalResources.feature_applicationSettingsName);
    return this._translateService.instant(PortalResources.configUpdateFailureInvalidInput, { configGroupName: configGroupName });
  }

  protected _createNewItem(): CustomFormGroup {
    const newItem = this._fb.group({
      name: [
        null,
        Validators.compose(this._validatorFns)],
      value: [null],
      isSlotSetting: [false]
    }) as CustomFormGroup;

    return newItem;
  }
}
