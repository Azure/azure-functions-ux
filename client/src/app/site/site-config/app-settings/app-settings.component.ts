import { SiteTabIds } from './../../../shared/models/constants';
import { ConfigSaveComponent, ArmSaveConfigs } from 'app/shared/components/config-save-component';
import { Component, Injector, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { SlotConfigNames } from './../../../shared/models/arm/slot-config-names';
import { ApplicationSettings } from './../../../shared/models/arm/application-settings';
import { LogService } from './../../../shared/services/log.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { CustomFormControl, CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj, ResourceId } from './../../../shared/models/arm/arm-obj';
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
export class AppSettingsComponent extends ConfigSaveComponent implements OnChanges, OnDestroy {
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

  private _validatorFns: ValidatorFn[];
  private _requiredValidator: RequiredValidator;
  private _uniqueAppSettingValidator: UniqueValidator;
  private _linuxAppSettingNameValidator: LinuxAppSettingNameValidator;
  private _isLinux: boolean;
  private _slotConfigNamesArmPath: string;

  constructor(
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _logService: LogService,
    private _siteService: SiteService,
    injector: Injector
  ) {
    super('AppSettingsComponent', injector, ['ApplicationSettings', 'SlotConfigNames'], SiteTabIds.applicationSettings);

    this._resetPermissionsAndLoadingState();

    this.newItem = null;
    this.originalItemsDeleted = 0;
  }

  protected get _isPristine() {
    return this.groupArray && this.groupArray.pristine;
  }

  protected setup(inputEvents: Observable<ResourceId>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(() => {
        this._saveFailed = false;
        this._resetSubmittedStates();
        this._resetConfigs();
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
          this.appSettingsArm = asResult.result;
        }

        if (slotNamesResult.isSuccessful) {
          this.slotConfigNamesArm = slotNamesResult.result;
        }

        if (this.appSettingsArm && this.slotConfigNamesArm) {
          this._setupForm(this.appSettingsArm, this.slotConfigNamesArm);
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
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resourceId']) {
      this.setInput(this.resourceId);
    }
    if (changes['mainForm'] && !changes['resourceId']) {
      this._setupForm(this.appSettingsArm, this.slotConfigNamesArm);
    }
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

  private _setupForm(appSettingsArm: ArmObj<ApplicationSettings>, slotConfigNamesArm: ArmObj<SlotConfigNames>) {
    if (!!appSettingsArm && !!slotConfigNamesArm) {
      if (!this._saveFailed || !this.groupArray) {
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

        const sortedGroupControls = (this.groupArray.controls as CustomFormGroup[])
          .sort((a, b) => a.controls['name'].value.localeCompare(b.controls['name'].value));
        this._validateAllControls(sortedGroupControls);
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

    this._saveFailed = false;
    this._resetSubmittedStates();
  }

  validate() {
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

  protected _getConfigsFromForms(saveConfigs: ArmSaveConfigs): ArmSaveConfigs {
    const appSettingsArm: ArmObj<ApplicationSettings> = (saveConfigs && saveConfigs.appSettingsArm) ?
      JSON.parse(JSON.stringify(saveConfigs.appSettingsArm)) : // TODO: [andimarc] not valid scenario - should never be already set
      JSON.parse(JSON.stringify(this.appSettingsArm));
    appSettingsArm.id = `${this.resourceId}/config/appSettings`;
    appSettingsArm.properties = {};

    const slotConfigNamesArm: ArmObj<SlotConfigNames> = (saveConfigs && saveConfigs.slotConfigNamesArm) ?
      JSON.parse(JSON.stringify(saveConfigs.slotConfigNamesArm)) :
      JSON.parse(JSON.stringify(this.slotConfigNamesArm));
    slotConfigNamesArm.id = this._slotConfigNamesArmPath;
    slotConfigNamesArm.properties.appSettingNames = slotConfigNamesArm.properties.appSettingNames || [];

    const appSettings: ApplicationSettings = appSettingsArm.properties;
    const appSettingNames: string[] = slotConfigNamesArm.properties.appSettingNames;

    let appSettingsPristine = true;
    let appSettingNamesPristine = true;

    this.groupArray.controls.forEach(group => {
      if ((group as CustomFormGroup).msExistenceState !== 'deleted') {
        const controls = (group as CustomFormGroup).controls;

        const name = controls['name'].value;

        appSettings[name] = controls['value'].value;

        if (appSettingsPristine && !group.pristine) {
          appSettingsPristine = controls['name'].pristine && controls['value'].pristine;
        }

        if (group.value.isSlotSetting) {
          if (appSettingNames.indexOf(name) === -1) {
            appSettingNames.push(name);
            appSettingNamesPristine = false;
          }
        } else {
          const index = appSettingNames.indexOf(name);
          if (index !== -1) {
            appSettingNames.splice(index, 1);
            appSettingNamesPristine = false;
          }
        }
      }
      else {
        appSettingsPristine = false;
      }
    });

    return {
      appSettingsArm: appSettingsPristine ? null : appSettingsArm,
      slotConfigNamesArm: appSettingNamesPristine ? null : slotConfigNamesArm
    };
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
