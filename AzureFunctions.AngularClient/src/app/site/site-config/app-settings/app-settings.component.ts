import { Injector } from '@angular/core';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { Response } from '@angular/http';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { SlotConfigNames } from './../../../shared/models/arm/slot-config-names';
import { SaveOrValidationResult } from './../site-config.component';
import { LogService } from './../../../shared/services/log.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { CustomFormControl, CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj, ArmObjMap, ResourceId } from './../../../shared/models/arm/arm-obj';
import { CacheService } from './../../../shared/services/cache.service';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { LinuxAppSettingNameValidator } from 'app/shared/validators/linuxAppSettingNameValidator';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { SiteService } from 'app/shared/services/site.service';
import { errorIds } from 'app/shared/models/error-ids';
import { LogCategories } from 'app/shared/models/constants';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./../site-config.component.scss']
})
export class AppSettingsComponent extends FeatureComponent<ResourceId> implements OnChanges, OnDestroy {
  @Input() mainForm: FormGroup;
  @Input() resourceId: ResourceId;

  public Resources = PortalResources;
  public groupArray: FormArray;
  public hasWritePermissions: boolean;
  public permissionsMessage: string;
  public showPermissionsMessage: boolean;
  public loadingFailureMessage: string;
  public loadingMessage: string;
  public newItem: CustomFormGroup;
  public originalItemsDeleted: number;

  private busyManager: BusyStateScopeManager;
  private _saveError: string;
  private _validatorFns: ValidatorFn[];
  private _requiredValidator: RequiredValidator;
  private _uniqueAppSettingValidator: UniqueValidator;
  private _linuxAppSettingNameValidator: LinuxAppSettingNameValidator;
  private _isLinux: boolean;
  private _appSettingsArm: ArmObj<any>;
  private _slotConfigNamesArm: ArmObj<SlotConfigNames>;
  private _slotConfigNamesArmPath: string;

  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _logService: LogService,
    private _siteService: SiteService,
    injector: Injector
  ) {
    super('AppSettingsComponent', injector);
    this.busyManager = new BusyStateScopeManager(this._broadcastService, 'site-tabs');

    this._resetPermissionsAndLoadingState();

    this.newItem = null;
    this.originalItemsDeleted = 0;
  }

  protected setup(inputEvents: Observable<ResourceId>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(() => {

        this.busyManager.setBusy();
        this._saveError = null;
        this._appSettingsArm = null;
        this._slotConfigNamesArm = null;
        this.groupArray = null;
        this.newItem = null;
        this.originalItemsDeleted = 0;
        this._resetPermissionsAndLoadingState();
        this._slotConfigNamesArmPath =
          `${new ArmSiteDescriptor(this.resourceId).getSiteOnlyResourceId()}/config/slotConfigNames`;

        return Observable.zip(
          this._siteService.getSite(this.resourceId),
          this._siteService.getAppSettings(this.resourceId, true),
          this._siteService.getSlotConfigNames(this.resourceId, true));
      })
      .do(results => {
        const siteResult = results[0];
        const asResult = results[1];
        const slotNamesResult = results[2];

        const noWritePermission = !asResult.isSuccessful
          && asResult.error.errorId === errorIds.armErrors.noAccess;

        const hasReadonlyLock = !asResult.isSuccessful
          && asResult.error.errorId === errorIds.armErrors.scopeLocked;

        this._setPermissions(!noWritePermission, hasReadonlyLock);

        if (siteResult.isSuccessful) {
          const site = siteResult.result;
          this._isLinux = ArmUtil.isLinuxApp(site);
        }

        if (asResult.isSuccessful) {
          this._appSettingsArm = asResult.result;
        }

        if (slotNamesResult.isSuccessful) {
          this._slotConfigNamesArm = slotNamesResult.result;
        }

        if (this._appSettingsArm && this._slotConfigNamesArm) {
          this._setupForm(this._appSettingsArm, this._slotConfigNamesArm);
        }

        const failedRequest = results.find(r => !r.isSuccessful);

        // If there's a failed request for a reason other than write permission, then show failure
        if (failedRequest && this.hasWritePermissions) {
          this._logService.error(LogCategories.appSettings, '/app-settings', failedRequest.error.message);
          this._setupForm(null, null);
          this.loadingFailureMessage = this._translateService.instant(PortalResources.configLoadFailure);
          this.loadingMessage = null;
        }

        this.loadingMessage = null;
        this.showPermissionsMessage = true;
        this.busyManager.clearBusy();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resourceId']) {
      this.setInput(this.resourceId);
    }
    if (changes['mainForm'] && !changes['resourceId']) {
      this._setupForm(this._appSettingsArm, this._slotConfigNamesArm);
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.busyManager.clearBusy();
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
        this.newItem = null;
        this.originalItemsDeleted = 0;
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

        this._validateAllControls(this.groupArray.controls as CustomFormGroup[]);
      }

      if (this.mainForm.contains('appSettings')) {
        this.mainForm.setControl('appSettings', this.groupArray);
      } else {
        this.mainForm.addControl('appSettings', this.groupArray);
      }
    } else {
      this.newItem = null;
      this.originalItemsDeleted = 0;
      this.groupArray = null;
      if (this.mainForm.contains('appSettings')) {
        this.mainForm.removeControl('appSettings');
      }
    }

    this._saveError = null;
  }

  validate(): SaveOrValidationResult {
    const groups = this.groupArray.controls;

    // Purge any added entries that were never modified
    for (let i = groups.length - 1; i >= 0; i--) {
      const group = groups[i] as CustomFormGroup;
      if (group.msStartInEditMode && group.pristine) {
        groups.splice(i, 1);
        if (group === this.newItem) {
          this.newItem = null;
        }
      }
    }

    this._validateAllControls(groups as CustomFormGroup[]);

    return {
      success: this.groupArray.valid,
      error: this.groupArray.valid ? null : this._validationFailureMessage()
    };
  }

  private _validateAllControls(groups: CustomFormGroup[]) {
    groups.forEach(group => {
      const controls = (<FormGroup>group).controls;
      for (const controlName in controls) {
        const control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    });
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

  deleteItem(group: FormGroup) {
    const groups = this.groupArray;
    const index = groups.controls.indexOf(group);
    if (index >= 0) {
      if ((group as CustomFormGroup).msExistenceState === 'original') {
        this._deleteOriginalItem(groups, group);
      } else {
        this._deleteAddedItem(groups, group, index);
      }
    }
  }

  private _deleteOriginalItem(groups: FormArray, group: FormGroup) {
    // Keep the deleted group around with its state set to dirty.
    // This keeps the overall state of this.groupArray and this.mainForm dirty.
    group.markAsDirty();

    // Set the group.msExistenceState to 'deleted' so we know to ignore it when validating and saving.
    (group as CustomFormGroup).msExistenceState = 'deleted';

    // Force the deleted group to have a valid state by clear all validators on the controls and then running validation.
    for (const key in group.controls) {
      const control = group.controls[key];
      control.clearAsyncValidators();
      control.clearValidators();
      control.updateValueAndValidity();
    }

    this.originalItemsDeleted++;

    groups.updateValueAndValidity();
  }

  private _deleteAddedItem(groups: FormArray, group: FormGroup, index: number) {
    // Remove group from groups
    groups.removeAt(index);
    if (group === this.newItem) {
      this.newItem = null;
    }

    // If group was dirty, then groups is also dirty.
    // If all the remaining controls in groups are pristine, mark groups as pristine.
    if (!group.pristine) {
      let pristine = true;
      for (const control of groups.controls) {
        pristine = pristine && control.pristine;
      }

      if (pristine) {
        groups.markAsPristine();
      }
    }

    groups.updateValueAndValidity();
  }

  addItem() {
    const groups = this.groupArray;

    this.newItem = this._fb.group({
      name: [
        null,
        Validators.compose(this._validatorFns)],
      value: [null],
      isSlotSetting: [false]
    }) as CustomFormGroup;

    this.newItem.msExistenceState = 'new';
    this.newItem.msStartInEditMode = true;
    groups.push(this.newItem);
  }
}
