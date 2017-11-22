import { LogCategories } from './../../../shared/models/constants';
import { Response } from '@angular/http';
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
import { SaveOrValidationResult } from './../site-config.component';
import { LogService } from './../../../shared/services/log.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { CustomFormControl, CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj, ArmObjMap } from './../../../shared/models/arm/arm-obj';
import { CacheService } from './../../../shared/services/cache.service';
import { AuthzService } from './../../../shared/services/authz.service';
import { SiteDescriptor } from 'app/shared/resourceDescriptors';
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

    private _saveError: string;

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
                this._saveError = null;
                this._connectionStringsArm = null;
                this._slotConfigNamesArm = null;
                this.groupArray = null;
                this.newItem = null;
                this.originalItemsDeleted = 0;
                this._resetPermissionsAndLoadingState();
                this._slotConfigNamesArmPath =
                    `${SiteDescriptor.getSiteDescriptor(this.resourceId).getSiteOnlyResourceId()}/config/slotConfigNames`;
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
                        this._cacheService.postArm(`${this.resourceId}/config/connectionstrings/list`, true) : Observable.of(null),
                    this.hasWritePermissions ?
                        this._cacheService.getArm(this._slotConfigNamesArmPath, true) : Observable.of(null),
                    (h, c, s) => ({ hasWritePermissions: h, connectionStringsResponse: c, slotConfigNamesResponse: s }));
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
            if (!this._saveError || !this.groupArray) {
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

            const connectionStringGroups = this.groupArray.controls;

            if (this.mainForm.contains('connectionStrings') && this.mainForm.controls['connectionStrings'].valid) {
                const connectionStringsArm: ArmObj<any> = JSON.parse(JSON.stringify(this._connectionStringsArm));
                connectionStringsArm.properties = {};

                this._slotConfigNamesArm.id = this._slotConfigNamesArmPath;
                const slotConfigNamesArm: ArmObj<any> = JSON.parse(JSON.stringify(this._slotConfigNamesArm));
                slotConfigNamesArm.properties.connectionStringNames = slotConfigNamesArm.properties.connectionStringNames || [];
                const connectionStringNames = slotConfigNamesArm.properties.connectionStringNames as string[];

                for (let i = 0; i < connectionStringGroups.length; i++) {
                    if ((connectionStringGroups[i] as CustomFormGroup).msExistenceState !== 'deleted') {
                        const connectionStringControl = connectionStringGroups[i];
                        const connectionString = {
                            value: connectionStringControl.value.value,
                            type: ConnectionStringType[connectionStringControl.value.type]
                        };

                        const name = connectionStringGroups[i].value.name;

                        connectionStringsArm.properties[name] = connectionString;

                        if (connectionStringGroups[i].value.isSlotSetting) {
                            if (connectionStringNames.indexOf(name) === -1) {
                                connectionStringNames.push(name);
                            }
                        } else {
                            const index = connectionStringNames.indexOf(name);
                            if (index !== -1) {
                                connectionStringNames.splice(index, 1);
                            }
                        }
                    }
                }

                configObjects['slotConfigNames'] = slotConfigNamesArm;
                configObjects['connectionStrings'] = connectionStringsArm;
            } else {
                configObjects.error = this._validationFailureMessage();
            }

            return configObjects;
        }
    }

    save(
        connectionStringsArm: ArmObj<any>,
        slotConfigNamesResponse: Response): Observable<SaveOrValidationResult> {

        // Don't make unnecessary PUT call if these settings haven't been changed
        if (this.groupArray.pristine) {
            return Observable.of({
                success: true,
                error: null
            });
        } else {
            return Observable.zip(
                this._cacheService.putArm(`${this.resourceId}/config/connectionstrings`, null, connectionStringsArm),
                Observable.of(slotConfigNamesResponse),
                (c, s) => ({ connectionStringsResponse: c, slotConfigNamesResponse: s })
            )
                .map(r => {
                    this._connectionStringsArm = r.connectionStringsResponse.json();
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
        const configGroupName = this._translateService.instant(PortalResources.connectionStrings);
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
