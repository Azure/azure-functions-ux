import { ConfigSaveComponent, ArmSaveConfigs } from 'app/shared/components/config-save-component';
import { LogService } from 'app/shared/services/log.service';
import { Links, LogCategories, SiteTabIds } from './../../../shared/models/constants';
import { errorIds } from 'app/shared/models/error-ids';
import { Component, Injector, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { SlotConfigNames } from './../../../shared/models/arm/slot-config-names';
import { ConnectionStringType, ConnectionStrings } from './../../../shared/models/arm/connection-strings';
import { EnumEx } from './../../../shared/Utilities/enumEx';
import { PortalResources } from './../../../shared/models/portal-resources';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { SelectOption } from './../../../shared/models/select-option';
import { CustomFormControl, CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj, ResourceId } from './../../../shared/models/arm/arm-obj';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { SiteService } from 'app/shared/services/site.service';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';

@Component({
  selector: 'connection-strings',
  templateUrl: './connection-strings.component.html',
  styleUrls: ['./../site-config.component.scss'],
})
export class ConnectionStringsComponent extends ConfigSaveComponent implements OnChanges, OnDestroy {
  @Input()
  mainForm: FormGroup;
  @Input()
  resourceId: ResourceId;

  public Resources = PortalResources;
  public groupArray: FormArray;
  public hasWritePermissions: boolean;
  public permissionsMessage: string;
  public showPermissionsMessage: boolean;
  public connectionStringTypes: DropDownElement<ConnectionStringType>[];
  public loadingFailureMessage: string;
  public loadingMessage: string;
  public FwLinks = Links;
  public newItem: CustomFormGroup;
  public originalItemsDeleted: number;
  public showValues: boolean;
  public showValuesOptions: SelectOption<boolean>[];
  public isFunctionApp: boolean;

  private _requiredValidator: RequiredValidator;
  private _uniqueCsValidator: UniqueValidator;
  private _slotConfigNamesArmPath: string;

  constructor(
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _siteService: SiteService,
    private _logService: LogService,
    injector: Injector
  ) {
    super('ConnectionStringsComponent', injector, ['ConnectionStrings', 'SlotConfigNames'], SiteTabIds.applicationSettings);

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
      .distinctUntilChanged()
      .switchMap(() => {
        this._saveFailed = false;
        this._resetSubmittedStates();
        this._resetConfigs();
        this.groupArray = null;
        this.newItem = null;
        this.originalItemsDeleted = 0;
        this._resetPermissionsAndLoadingState();
        this.isFunctionApp = false;
        this._slotConfigNamesArmPath = `${new ArmSiteDescriptor(this.resourceId).getSiteOnlyResourceId()}/config/slotConfigNames`;

        return Observable.zip(
          this._siteService.getConnectionStrings(this.resourceId, true),
          this._siteService.getSlotConfigNames(this.resourceId),
          this._siteService.getSite(this.resourceId)
        );
      })
      .do(results => {
        const csResult = results[0];
        const slotNamesResult = results[1];
        const siteResult = results[2];

        const noWritePermission = !csResult.isSuccessful && csResult.error.errorId === errorIds.armErrors.noAccess;

        const hasReadOnlyLock = !csResult.isSuccessful && csResult.error.errorId === errorIds.armErrors.scopeLocked;

        this.isFunctionApp = siteResult.isSuccessful && ArmUtil.isFunctionApp(siteResult.result);

        this._setPermissions(!noWritePermission, hasReadOnlyLock);
        if (this.hasWritePermissions) {
          const failedRequest = results.find(r => !r.isSuccessful);
          if (failedRequest) {
            this._logService.error(LogCategories.connectionStrings, '/connection-strings', failedRequest.error);
            this._setupForm(null, null);
            this.loadingFailureMessage = this._translateService.instant(PortalResources.configLoadFailure);
            this.loadingMessage = null;
            this.showPermissionsMessage = true;
          } else {
            this.connectionStringsArm = csResult.result;
            this.slotConfigNamesArm = slotNamesResult.result;
            this._setupForm(this.connectionStringsArm, this.slotConfigNamesArm);
          }
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
      this._setupForm(this.connectionStringsArm, this.slotConfigNamesArm);
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

  private _setupForm(connectionStringsArm: ArmObj<ConnectionStrings>, slotConfigNamesArm: ArmObj<SlotConfigNames>) {
    if (!!connectionStringsArm && !!slotConfigNamesArm) {
      if (!this._saveFailed || !this.groupArray) {
        this.newItem = null;
        this.originalItemsDeleted = 0;
        this.groupArray = this._fb.array([]);

        this._requiredValidator = new RequiredValidator(this._translateService);

        this._uniqueCsValidator = new UniqueValidator(
          'name',
          this.groupArray,
          this._translateService.instant(PortalResources.validation_duplicateError)
        );

        const stickyConnectionStringNames = slotConfigNamesArm.properties.connectionStringNames || [];

        for (const name in connectionStringsArm.properties) {
          if (connectionStringsArm.properties.hasOwnProperty(name)) {
            const connectionString = connectionStringsArm.properties[name];
            const connectionStringDropDownTypes = this._getConnectionStringTypes(connectionString.type);

            const group = this._fb.group({
              name: [
                { value: name, disabled: !this.hasWritePermissions },
                Validators.compose([
                  this._requiredValidator.validate.bind(this._requiredValidator),
                  this._uniqueCsValidator.validate.bind(this._uniqueCsValidator),
                ]),
              ],
              value: [
                { value: connectionString.value, disabled: !this.hasWritePermissions },
                this._requiredValidator.validate.bind(this._requiredValidator),
              ],
              type: [{ value: connectionStringDropDownTypes.find(t => t.default).value, disabled: !this.hasWritePermissions }],
              isSlotSetting: [{ value: stickyConnectionStringNames.indexOf(name) !== -1, disabled: !this.hasWritePermissions }],
            }) as CustomFormGroup;

            (<any>group).csTypes = connectionStringDropDownTypes;

            group.msExistenceState = 'original';
            this.groupArray.push(group);
          }
        }

        this._validateAllControls(this.groupArray.controls as CustomFormGroup[]);
      }

      if (this.mainForm.contains('connectionStrings')) {
        this.mainForm.setControl('connectionStrings', this.groupArray);
      } else {
        this.mainForm.addControl('connectionStrings', this.groupArray);
      }
    } else {
      this.newItem = null;
      this.originalItemsDeleted = 0;
      this.groupArray = null;
      if (this.mainForm.contains('connectionStrings')) {
        this.mainForm.removeControl('connectionStrings');
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
    const connectionStringsArm: ArmObj<ConnectionStrings> =
      saveConfigs && saveConfigs.connectionStringsArm
        ? JSON.parse(JSON.stringify(saveConfigs.connectionStringsArm)) // TODO: [andimarc] not valid scenario - should never be already set
        : JSON.parse(JSON.stringify(this.connectionStringsArm));
    connectionStringsArm.id = `${this.resourceId}/config/connectionStrings`;
    connectionStringsArm.properties = {};

    const slotConfigNamesArm: ArmObj<SlotConfigNames> =
      saveConfigs && saveConfigs.slotConfigNamesArm
        ? JSON.parse(JSON.stringify(saveConfigs.slotConfigNamesArm))
        : JSON.parse(JSON.stringify(this.slotConfigNamesArm));
    slotConfigNamesArm.id = this._slotConfigNamesArmPath;
    slotConfigNamesArm.properties.connectionStringNames = slotConfigNamesArm.properties.connectionStringNames || [];

    const connectionStrings: ConnectionStrings = connectionStringsArm.properties;
    const connectionStringNames: string[] = slotConfigNamesArm.properties.connectionStringNames;

    let connectionStringsPristine = true;
    let connectionStringNamesPristine = true;

    this.groupArray.controls.forEach(group => {
      if ((group as CustomFormGroup).msExistenceState !== 'deleted') {
        const controls = (group as CustomFormGroup).controls;

        const name = controls['name'].value;

        connectionStrings[name] = {
          value: controls['value'].value,
          type: controls['type'].value,
        };

        if (connectionStringsPristine && !group.pristine) {
          connectionStringsPristine = controls['name'].pristine && controls['value'].pristine && controls['type'].pristine;
        }

        if (group.value.isSlotSetting) {
          if (connectionStringNames.indexOf(name) === -1) {
            connectionStringNames.push(name);
            connectionStringNamesPristine = false;
          }
        } else {
          const index = connectionStringNames.indexOf(name);
          if (index !== -1) {
            connectionStringNames.splice(index, 1);
            connectionStringNamesPristine = false;
          }
        }
      } else {
        connectionStringsPristine = false;
      }
    });

    return {
      connectionStringsArm: connectionStringsPristine ? null : connectionStringsArm,
      slotConfigNamesArm: connectionStringNamesPristine ? null : slotConfigNamesArm,
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
    const connectionStringDropDownTypes = this._getConnectionStringTypes(ConnectionStringType.SQLAzure);

    this.newItem = this._fb.group({
      name: [
        null,
        Validators.compose([
          this._requiredValidator.validate.bind(this._requiredValidator),
          this._uniqueCsValidator.validate.bind(this._uniqueCsValidator),
        ]),
      ],
      value: [null, this._requiredValidator.validate.bind(this._requiredValidator)],
      type: [connectionStringDropDownTypes.find(t => t.default).value],
      isSlotSetting: [false],
    }) as CustomFormGroup;

    (<any>this.newItem).csTypes = connectionStringDropDownTypes;

    this.newItem.msExistenceState = 'new';
    this.newItem.msStartInEditMode = true;
    groups.push(this.newItem);
  }

  private _getConnectionStringTypes(defaultType: ConnectionStringType) {
    const connectionStringDropDownTypes: DropDownElement<string>[] = [];

    EnumEx.getNamesAndValues(ConnectionStringType).forEach(pair => {
      // We should only include supported connection string types. However, in the case where an
      // unsupported type is already set in the conf, we must also include that particular type.
      if (ConnectionStringType.isSupported(pair.value) || pair.value === defaultType) {
        connectionStringDropDownTypes.push({
          displayLabel: pair.name,
          value: pair.name,
          default: pair.value === defaultType,
        });
      }
    });

    return connectionStringDropDownTypes;
  }

  updateShowValues(showValues: boolean) {
    this.showValues = showValues;
  }
}
