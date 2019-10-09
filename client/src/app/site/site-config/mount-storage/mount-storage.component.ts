import { Component, OnChanges, OnDestroy, Input, Injector, SimpleChanges } from '@angular/core';
import { ConfigSaveComponent, ArmSaveConfigs } from 'app/shared/components/config-save-component';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ResourceId, ArmObj } from 'app/shared/models/arm/arm-obj';
import { SiteTabIds, LogCategories } from 'app/shared/models/constants';
import { Observable } from 'rxjs/Observable';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { PortalService } from 'app/shared/services/portal.service';
import { Site } from 'app/shared/models/arm/site';
import { SiteService } from 'app/shared/services/site.service';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { OsType } from 'app/shared/models/arm/stacks';
import { EventMessage, BroadcastEvent } from 'app/shared/models/broadcast-event';
import { ByosData, ByosStorageAccounts, StorageType, StorageTypeSetting, ByosInputData } from 'app/site/byos/byos';
import { PortalResources } from 'app/shared/models/portal-resources';
import { AuthzService } from 'app/shared/services/authz.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomFormGroup, CustomFormControl } from 'app/controls/click-to-edit/click-to-edit.component';
import { SelectOption } from 'app/shared/models/select-option';
import { LogService } from 'app/shared/services/log.service';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { StoragePathValidator } from 'app/shared/validators/storagePathValidator';

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

  private _requiredValidator: RequiredValidator;
  private _uniqueNameValidator: UniqueValidator;
  private _storagePathValidator: StoragePathValidator;

  constructor(
    private _portalService: PortalService,
    private _siteService: SiteService,
    private _authZService: AuthzService,
    private _translateService: TranslateService,
    private _logService: LogService,
    private _fb: FormBuilder,
    injector: Injector
  ) {
    super('MountStorageComponent', injector, ['AzureStorageAccounts'], SiteTabIds.applicationSettings);
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
          this._siteService.getAzureStorageAccounts(resourceId),
          this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(this.resourceId)
        );
      })
      .do(results => {
        const [siteResponse, azureStorageAccountsResponse, permissionResponse, readOnlyLockResponse] = results;
        this._setPermissions(permissionResponse, readOnlyLockResponse);
        this._site = siteResponse.result;

        if (this.hasWritePermissions) {
          const failedRequest = [siteResponse, azureStorageAccountsResponse].find(r => !r.isSuccessful);
          if (failedRequest) {
            this._logService.error(LogCategories.byos, '/mount-storage', failedRequest.error);
            this._setupForm(null);
            this.loadingFailureMessage = this._translateService.instant(PortalResources.configLoadFailure);
            this.loadingMessage = null;
            this.showPermissionsMessage = true;
          } else {
            this.azureStorageAccountsArm = azureStorageAccountsResponse.result;
            this._setupForm(this.azureStorageAccountsArm);
          }
        }

        this.loadingMessage = null;
        this.showPermissionsMessage = true;
      });
  }

  protected _getConfigsFromForms(saveConfigs: ArmSaveConfigs): ArmSaveConfigs {
    const storageAccountsArm: ArmObj<ByosStorageAccounts> =
      saveConfigs && saveConfigs.azureStorageAccountsArm
        ? JSON.parse(JSON.stringify(saveConfigs.azureStorageAccountsArm))
        : JSON.parse(JSON.stringify(this.azureStorageAccountsArm));
    storageAccountsArm.id = `${this.resourceId}/config/azurestorageaccounts`;
    storageAccountsArm.properties = {};

    const storageAccounts: ByosStorageAccounts = storageAccountsArm.properties;

    this.groupArray.controls.forEach(group => {
      const formGroup = group as CustomFormGroup;
      if (formGroup.msExistenceState !== 'deleted') {
        const controls = formGroup.controls;
        const mountPath = controls['mountPath'].value;
        const shareName = controls['shareName'].value;
        const accessKey = controls['accessKey'].value;
        const type = controls['type'].value;
        const name = controls['name'].value;
        let accountName = controls['accountName'].value;

        if (!ArmUtil.isLinuxApp(this._site)) {
          // NOTE(michinoy): This is a temporary fix. Windows backend is throwing an error if the
          // dns suffix is not explicitly part of the name.
          accountName = `${accountName}.file.core.windows.net`;
        }

        storageAccounts[name] = {
          type,
          accountName,
          shareName,
          accessKey,
          mountPath,
        };
      }
    });

    return {
      azureStorageAccountsArm: storageAccountsArm,
    };
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['resourceId']) {
      this.setInput(this.resourceId);
    }

    if (changes['mainForm'] && !changes['resourceId']) {
      this._setupForm(this.azureStorageAccountsArm);
    }
  }

  public addItem() {
    const descriptor: ArmSiteDescriptor = new ArmSiteDescriptor(this._site.id);
    let currentNames: string[] = [];

    if (this.groupArray && this.groupArray.controls) {
      currentNames = this.groupArray.controls.map(control => {
        const form = <FormGroup>control;
        return form.controls.name.value;
      });
    }

    this._portalService.openFrameBlade(
      {
        detailBlade: 'ByosPickerFrameBlade',
        detailBladeInputs: {
          id: this._site.id,
          data: <ByosInputData>{
            resourceId: this._site.id,
            isFunctionApp: false,
            subscriptionId: descriptor.subscription,
            location: this._site.location,
            os: ArmUtil.isLinuxApp(this._site) ? OsType.Linux : OsType.Windows,
            currentNames,
          },
        },
      },
      'site-config'
    );
  }

  public validate() {
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

  public updateShowValues(showValues: boolean) {
    this.showValues = showValues;
  }

  public deleteItem(group: FormGroup) {
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

  private _setupByosConfigSubscription() {
    this._broadcastService
      .getEvents<EventMessage<ByosData>>(BroadcastEvent.ByosConfigReceived)
      .filter(m => {
        return m.resourceId.toLowerCase() === this.resourceId.toLowerCase();
      })
      .subscribe(message => {
        const byosConfig = message.metadata;
        const type = byosConfig.type === StorageType.azureFiles ? StorageTypeSetting.azureFiles : StorageTypeSetting.azureBlob;
        const groups = this.groupArray;

        this.newItem = this._fb.group({
          name: [
            { value: byosConfig.name, disabled: !this.hasWritePermissions },
            Validators.compose([
              this._requiredValidator.validate.bind(this._requiredValidator),
              this._uniqueNameValidator.validate.bind(this._uniqueNameValidator),
            ]),
          ],
          mountPath: [
            { value: byosConfig.mountPath, disabled: !this.hasWritePermissions },
            Validators.compose([this._storagePathValidator.validate.bind(this._storagePathValidator)]),
          ],
          displayType: [
            {
              value:
                byosConfig.type === StorageType.azureFiles
                  ? this._translateService.instant(PortalResources.files)
                  : this._translateService.instant(PortalResources.blob),
              disabled: !this.hasWritePermissions,
            },
          ],
          accountName: [
            { value: byosConfig.accountName, disabled: !this.hasWritePermissions },
            Validators.compose([this._requiredValidator.validate.bind(this._requiredValidator)]),
          ],
          shareName: [
            { value: byosConfig.shareName, disabled: !this.hasWritePermissions },
            Validators.compose([this._requiredValidator.validate.bind(this._requiredValidator)]),
          ],
          accessKey: [
            { value: byosConfig.accessKey, disabled: !this.hasWritePermissions },
            Validators.compose([this._requiredValidator.validate.bind(this._requiredValidator)]),
          ],
          type: [
            { value: type, disabled: !this.hasWritePermissions },
            Validators.compose([this._requiredValidator.validate.bind(this._requiredValidator)]),
          ],
        }) as CustomFormGroup;

        this.newItem.msExistenceState = 'new';
        this.newItem.msStartInEditMode = true;
        groups.push(this.newItem);
        this.newItem.markAsDirty();
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
    this.loadingFailureMessage = '';
    this.loadingMessage = this._translateService.instant(PortalResources.loading);
    this.enableAddItemLink = false;
  }

  private _setupForm(storageAccountsArm: ArmObj<ByosStorageAccounts>) {
    if (!!storageAccountsArm) {
      if (!this._saveFailed || !this.groupArray) {
        this.newItem = null;
        this.originalItemsDeleted = 0;
        this.groupArray = this._fb.array([]);
        this._requiredValidator = new RequiredValidator(this._translateService);
        this._uniqueNameValidator = new UniqueValidator(
          'name',
          this.groupArray,
          this._translateService.instant(PortalResources.validation_duplicateError)
        );
        this._storagePathValidator = new StoragePathValidator(
          this._translateService,
          ArmUtil.isLinuxApp(this._site) ? OsType.Linux : OsType.Windows
        );

        const isWindows = !ArmUtil.isLinuxApp(this._site);

        for (const name in storageAccountsArm.properties) {
          if (storageAccountsArm.properties.hasOwnProperty(name)) {
            const storageAccount = storageAccountsArm.properties[name];
            let accountName = storageAccount.accountName;

            if (isWindows && accountName.endsWith('.file.core.windows.net')) {
              // NOTE(michinoy): This is a temporary fix. Windows backend is throwing an error if the
              // dns suffix is not explicitly part of the name. When showing in the grid, not to include
              // the dns suffix.
              accountName = accountName.replace('.file.core.windows.net', '');
            }

            const group = this._fb.group({
              name: [
                { value: name, disabled: !this.hasWritePermissions },
                Validators.compose([
                  this._requiredValidator.validate.bind(this._requiredValidator),
                  this._uniqueNameValidator.validate.bind(this._uniqueNameValidator),
                ]),
              ],
              mountPath: [
                { value: storageAccount.mountPath, disabled: !this.hasWritePermissions },
                Validators.compose([this._storagePathValidator.validate.bind(this._storagePathValidator)]),
              ],
              displayType: [
                {
                  value:
                    storageAccount.type === StorageTypeSetting.azureFiles
                      ? this._translateService.instant(PortalResources.files)
                      : this._translateService.instant(PortalResources.blob),
                  disabled: !this.hasWritePermissions,
                },
              ],
              accountName: [
                { value: accountName, disabled: !this.hasWritePermissions },
                Validators.compose([this._requiredValidator.validate.bind(this._requiredValidator)]),
              ],
              shareName: [
                { value: storageAccount.shareName, disabled: !this.hasWritePermissions },
                Validators.compose([this._requiredValidator.validate.bind(this._requiredValidator)]),
              ],
              accessKey: [
                { value: storageAccount.accessKey, disabled: !this.hasWritePermissions },
                Validators.compose([this._requiredValidator.validate.bind(this._requiredValidator)]),
              ],
              type: [
                { value: storageAccount.type, disabled: !this.hasWritePermissions },
                Validators.compose([this._requiredValidator.validate.bind(this._requiredValidator)]),
              ],
            }) as CustomFormGroup;

            group.msExistenceState = 'original';
            this.groupArray.push(group);
          }
        }
      }

      if (this.mainForm.contains('storageAccounts')) {
        this.mainForm.setControl('storageAccounts', this.groupArray);
      } else {
        this.mainForm.addControl('storageAccounts', this.groupArray);
      }
    } else {
      this.newItem = null;
      this.originalItemsDeleted = 0;
      this.groupArray = null;
      if (this.mainForm.contains('storageAccounts')) {
        this.mainForm.removeControl('storageAccounts');
      }
    }

    this._saveFailed = false;
    this._resetSubmittedStates();
  }
}
