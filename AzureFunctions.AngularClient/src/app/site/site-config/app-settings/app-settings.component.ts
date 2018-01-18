import { LogCategories } from './../../../shared/models/constants';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { SlotConfigNames } from './../../../shared/models/arm/slot-config-names';
import { ApplicationSettings } from './../../../shared/models/arm/application-settings';
import { ArmSavePayloads, /*ArmResultObj,*/ ArmSaveResults, SaveOrValidationResult } from './../site-config.component';
import { LogService } from './../../../shared/services/log.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { CustomFormControl, CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj } from './../../../shared/models/arm/arm-obj';
import { CacheService } from './../../../shared/services/cache.service';
import { AuthzService } from './../../../shared/services/authz.service';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./../site-config.component.scss']
})
export class AppSettingsComponent implements OnChanges, OnDestroy {
  public Resources = PortalResources;
  public groupArray: FormArray;

  private _resourceIdStream: Subject<string>;
  private _resourceIdSubscription: RxSubscription;
  public hasWritePermissions: boolean;
  public permissionsMessage: string;
  public showPermissionsMessage: boolean;

  private _busyManager: BusyStateScopeManager;

  private _saveFailed: boolean;
  private _appSettingsSubmitted: boolean;
  private _slotConfigNamesSubmitted: boolean;

  private _requiredValidator: RequiredValidator;
  private _uniqueAppSettingValidator: UniqueValidator;

  private _appSettingsArm: ArmObj<ApplicationSettings>;
  private _slotConfigNamesArm: ArmObj<SlotConfigNames>;

  public loadingFailureMessage: string;
  public loadingMessage: string;

  public newItem: CustomFormGroup;
  public originalItemsDeleted: number;

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
    this._busyManager = new BusyStateScopeManager(broadcastService, 'site-tabs');

    this._resetPermissionsAndLoadingState();

    this.newItem = null;
    this.originalItemsDeleted = 0;

    this._resourceIdStream = new Subject<string>();
    this._resourceIdSubscription = this._resourceIdStream
      .distinctUntilChanged()
      .switchMap(() => {
        this._busyManager.setBusy();
        this._saveFailed = false;
        this._appSettingsSubmitted = false;
        this._slotConfigNamesSubmitted = false;
        this._appSettingsArm = null;
        this._slotConfigNamesArm = null;
        this.groupArray = null;
        this.newItem = null;
        this.originalItemsDeleted = 0;
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
          this.hasWritePermissions ?
            this._cacheService.postArm(`${this.resourceId}/config/appSettings/list`, true) : Observable.of(null),
          this.hasWritePermissions ?
            this._cacheService.getArm(this._slotConfigNamesArmPath, true) : Observable.of(null),
          (h, a, s) => ({ hasWritePermissions: h, appSettingsResponse: a, slotConfigNamesResponse: s })
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

        const stickyAppSettingNames = slotConfigNamesArm.properties.appSettingNames || [];

        for (const name in appSettingsArm.properties) {

          if (appSettingsArm.properties.hasOwnProperty(name)) {
            const group = this._fb.group({
              name: [
                { value: name, disabled: !this.hasWritePermissions },
                Validators.compose([
                  this._requiredValidator.validate.bind(this._requiredValidator),
                  this._uniqueAppSettingValidator.validate.bind(this._uniqueAppSettingValidator)])],
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

    this._saveFailed = false;
    this._appSettingsSubmitted = false;
    this._slotConfigNamesSubmitted = false;
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

  getSavePayload(payloads: ArmSavePayloads) {
    this._appSettingsSubmitted = false;
    this._slotConfigNamesSubmitted = false;

    if (!this.groupArray.pristine) {
      const config = this._getConfigFromForms();

      if (config.appSettingsArm) {
        if (payloads.applicationSettings) {
          // This should never be set by any other component.
          // TODO: throw exception?
        }
        payloads.applicationSettings = config.appSettingsArm;
        this._appSettingsSubmitted = true;
      }

      if (config.slotConfigNamesArm) {
        if (!payloads.slotConfigNames) {
          payloads.slotConfigNames = config.slotConfigNamesArm;
        } else {
          payloads.slotConfigNames.properties.appSettingNames = config.slotConfigNamesArm.properties.appSettingNames;
        }
        this._slotConfigNamesSubmitted = true;
      }
    }
  }

  private _getConfigFromForms(): { appSettingsArm: ArmObj<ApplicationSettings>, slotConfigNamesArm: ArmObj<SlotConfigNames> } {
    this._appSettingsArm.id = `${this.resourceId}/config/appSettings`;
    const appSettingsArm: ArmObj<ApplicationSettings> = JSON.parse(JSON.stringify(this._appSettingsArm));
    appSettingsArm.properties = {};

    this._slotConfigNamesArm.id = this._slotConfigNamesArmPath;
    const slotConfigNamesArm: ArmObj<SlotConfigNames> = JSON.parse(JSON.stringify(this._slotConfigNamesArm));
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

  processSaveResult(resluts: ArmSaveResults) {
    if (this._appSettingsSubmitted) {
      this._appSettingsSubmitted = false;

      if (!resluts || !resluts.applicationSettings) {
        //TODO
        this._saveFailed = true;
        throw 'no result';
      }

      if (resluts.applicationSettings.success && resluts.applicationSettings.result) {
        this._appSettingsArm = resluts.applicationSettings.result;
      } else {
        this._saveFailed = true;
      }
    }

    if (this._slotConfigNamesSubmitted) {
      this._slotConfigNamesSubmitted = false;

      if (!resluts || !resluts.slotConfigNames) {
        //TODO
        this._saveFailed = true;
        throw 'no result';
      }

      if (resluts.slotConfigNames.success && resluts.slotConfigNames.result) {
        this._slotConfigNamesArm = resluts.slotConfigNames.result;
      } else {
        this._saveFailed = true;
      }
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
        Validators.compose([
          this._requiredValidator.validate.bind(this._requiredValidator),
          this._uniqueAppSettingValidator.validate.bind(this._uniqueAppSettingValidator)])],
      value: [null],
      isSlotSetting: [false]
    }) as CustomFormGroup;

    this.newItem.msExistenceState = 'new';
    this.newItem.msStartInEditMode = true;
    groups.push(this.newItem);
  }
}
