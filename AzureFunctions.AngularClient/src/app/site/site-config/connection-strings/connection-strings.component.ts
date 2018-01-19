import { LogCategories } from './../../../shared/models/constants';
import { BroadcastService } from './../../../shared/services/broadcast.service';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { SlotConfigNames } from './../../../shared/models/arm/slot-config-names';
import { ConnectionStrings, ConnectionStringType } from './../../../shared/models/arm/connection-strings';
import { EnumEx } from './../../../shared/Utilities/enumEx';
import { ArmSaveConfigs, ArmSaveResults } from './../site-config.component';
import { LogService } from './../../../shared/services/log.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { CustomFormControl, CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj } from './../../../shared/models/arm/arm-obj';
import { CacheService } from './../../../shared/services/cache.service';
import { AuthzService } from './../../../shared/services/authz.service';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';

@Component({
    selector: 'connection-strings',
    templateUrl: './connection-strings.component.html',
    styleUrls: ['./../site-config.component.scss']
})
export class ConnectionStringsComponent implements OnChanges, OnDestroy {
    public Resources = PortalResources;
    public groupArray: FormArray;

    private _resourceIdStream: Subject<string>;
    private _resourceIdSubscription: RxSubscription;
    public hasWritePermissions: boolean;
    public permissionsMessage: string;
    public showPermissionsMessage: boolean;

    private _busyManager: BusyStateScopeManager;

    private _saveFailed: boolean;
    private _connectionStringsSubmitted: boolean;
    private _slotConfigNamesSubmitted: boolean;

    private _requiredValidator: RequiredValidator;
    private _uniqueCsValidator: UniqueValidator;

    private _connectionStringsArm: ArmObj<ConnectionStrings>;
    private _slotConfigNamesArm: ArmObj<SlotConfigNames>;
    public connectionStringTypes: DropDownElement<ConnectionStringType>[];

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
                this._connectionStringsSubmitted = false;
                this._slotConfigNamesSubmitted = false;
                this._connectionStringsArm = null;
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
                    (wp, rl) => ({ writePermission: wp, readOnlyLock: rl }));
            })
            .mergeMap(p => {
                this._setPermissions(p.writePermission, p.readOnlyLock);
                return Observable.zip(
                    Observable.of(this.hasWritePermissions),
                    this.hasWritePermissions ?
                        this._cacheService.postArm(`${this.resourceId}/config/connectionStrings/list`, true) : Observable.of(null),
                    this.hasWritePermissions ?
                        this._cacheService.getArm(this._slotConfigNamesArmPath, true) : Observable.of(null),
                    (h, c, scn) => ({ hasWritePermissions: h, connectionStringsResponse: c, slotConfigNamesResponse: scn }));
            })
            .do(null, error => {
                this._logService.error(LogCategories.connectionStrings, '/connection-strings', error);
                this._setupForm(null, null);
                this.loadingFailureMessage = this._translateService.instant(PortalResources.configLoadFailure);
                this.loadingMessage = null;
                this.showPermissionsMessage = true;
                this._busyManager.clearBusy();
            })
            .retry()
            .subscribe(r => {
                if (r.hasWritePermissions) {
                    this._connectionStringsArm = r.connectionStringsResponse.json();
                    this._slotConfigNamesArm = r.slotConfigNamesResponse.json();
                    this._setupForm(this._connectionStringsArm, this._slotConfigNamesArm);
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
            this._setupForm(this._connectionStringsArm, this._slotConfigNamesArm);
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
                    this._translateService.instant(PortalResources.validation_duplicateError));

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
                                    this._uniqueCsValidator.validate.bind(this._uniqueCsValidator)])],
                            value: [
                                { value: connectionString.value, disabled: !this.hasWritePermissions },
                                this._requiredValidator.validate.bind(this._requiredValidator)],
                            type: [{ value: connectionStringDropDownTypes.find(t => t.default).value, disabled: !this.hasWritePermissions }],
                            isSlotSetting: [{ value: stickyConnectionStringNames.indexOf(name) !== -1, disabled: !this.hasWritePermissions }]
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

        this._saveFailed = null;
        this._connectionStringsSubmitted = false;
        this._slotConfigNamesSubmitted = false;
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

    getSaveConfigs(saveConfigs: ArmSaveConfigs) {
        this._connectionStringsSubmitted = false;
        this._slotConfigNamesSubmitted = false;

        if (!this.groupArray.pristine) {
            const configs = this._getConfigsFromForms(saveConfigs);

            if (configs.connectionStrings) {
                saveConfigs.connectionStrings = configs.connectionStrings;
                this._connectionStringsSubmitted = true;
            }

            if (configs.slotConfigNames) {
                saveConfigs.slotConfigNames = configs.slotConfigNames;
                this._slotConfigNamesSubmitted = true;
            }
        }
    }

    private _getConfigsFromForms(saveConfigs: ArmSaveConfigs): ArmSaveConfigs {
        const connectionStringsArm: ArmObj<ConnectionStrings> = (saveConfigs && saveConfigs.connectionStrings) ?
            JSON.parse(JSON.stringify(saveConfigs.connectionStrings)) : // TODO: [andimarc] not valid scenario - should never be already set
            JSON.parse(JSON.stringify(this._connectionStringsArm));
        connectionStringsArm.id = `${this.resourceId}/config/connectionStrings`;
        connectionStringsArm.properties = {};

        const slotConfigNamesArm: ArmObj<SlotConfigNames> = (saveConfigs && saveConfigs.slotConfigNames) ?
            JSON.parse(JSON.stringify(saveConfigs.slotConfigNames)) :
            JSON.parse(JSON.stringify(this._slotConfigNamesArm));
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
                    type: controls['type'].value
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
            }
            else {
                connectionStringsPristine = false;
                if (group.value.isSlotSetting) {
                    connectionStringNamesPristine = false;
                }
            }
        });

        return {
            connectionStrings: connectionStringsPristine ? null : connectionStringsArm,
            slotConfigNames: connectionStringNamesPristine ? null : slotConfigNamesArm
        };
    }

    processSaveResults(results: ArmSaveResults) {
        if (results && results.connectionStrings && results.connectionStrings.success && results.connectionStrings.result) {
            this._connectionStringsArm = results.connectionStrings.result;
        } else if (this._connectionStringsSubmitted) {
            this._connectionStringsSubmitted = false;
            this._saveFailed = true;
            //TODO: [andimarc] throw exception if (!result || !result.connectionStrings)?
        }

        if (results && results.slotConfigNames && results.slotConfigNames.success && results.slotConfigNames.result) {
            this._slotConfigNamesArm = results.slotConfigNames.result;
        } else if (this._slotConfigNamesSubmitted) {
            this._slotConfigNamesSubmitted = false;
            this._saveFailed = true;
            //TODO: [andimarc] throw exception if (!result || !result.slotConfigNames)?
        }
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
                    this._uniqueCsValidator.validate.bind(this._uniqueCsValidator)])],
            value: [
                null,
                this._requiredValidator.validate.bind(this._requiredValidator)],
            type: [connectionStringDropDownTypes.find(t => t.default).value],
            isSlotSetting: [false]
        }) as CustomFormGroup;

        (<any>this.newItem).csTypes = connectionStringDropDownTypes;

        this.newItem.msExistenceState = 'new';
        this.newItem.msStartInEditMode = true;
        groups.push(this.newItem);
    }

    private _getConnectionStringTypes(defaultType: ConnectionStringType) {
        const connectionStringDropDownTypes: DropDownElement<string>[] = [];

        EnumEx.getNamesAndValues(ConnectionStringType).forEach(pair => {
            connectionStringDropDownTypes.push({
                displayLabel: pair.name,
                value: pair.name,
                default: pair.value === defaultType
            });
        });

        return connectionStringDropDownTypes;
    }
}
