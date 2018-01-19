import { BusyStateScopeManager } from './../../busy-state/busy-state-scope-manager';
import { Component, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { SiteTabIds } from './../../shared/models/constants';
import { BroadcastService } from './../../shared/services/broadcast.service';
import { AiService } from './../../shared/services/ai.service';
import { PortalResources } from './../../shared/models/portal-resources';
import { EnumEx } from './../../shared/Utilities/enumEx';
import { DropDownElement } from './../../shared/models/drop-down-element';
import { ConnectionStrings, ConnectionStringType } from './../../shared/models/arm/connection-strings';
import { CustomFormGroup, CustomFormControl } from './../../controls/click-to-edit/click-to-edit.component';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { CacheService } from './../../shared/services/cache.service';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';

@Component({
    selector: 'site-config-standalone',
    templateUrl: './site-config-standalone.component.html',
    styleUrls: ['./site-config-standalone.component.scss']
})
export class SiteConfigStandaloneComponent implements OnDestroy {
    public viewInfoStream: Subject<TreeViewInfo<SiteData>>;

    public mainForm: FormGroup;
    private _valueSubscription: RxSubscription;
    public connectionStringTypes: DropDownElement<ConnectionStringType>[];
    public Resources = PortalResources;

    private _viewInfoSubscription: RxSubscription;
    private _appSettingsArm: ArmObj<any>;
    private _connectionStringsArm: ArmObj<ConnectionStrings>;
    private _resourceId: string;

    private _requiredValidator: RequiredValidator;
    private _uniqueAppSettingValidator: UniqueValidator;
    private _uniqueCsValidator: UniqueValidator;

    private _busyManager: BusyStateScopeManager;

    constructor(
        private _cacheService: CacheService,
        private _fb: FormBuilder,
        private _translateService: TranslateService,
        private _aiService: AiService,
        private _broadcastService: BroadcastService,
    ) {
        this._busyManager = new BusyStateScopeManager(_broadcastService, 'site-tabs');

        this.viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
        this._viewInfoSubscription = this.viewInfoStream
            .distinctUntilChanged()
            .switchMap(viewInfo => {
                this._busyManager.setBusy();
                this._resourceId = viewInfo.resourceId;

                // Not bothering to check RBAC since this component will only be used in Standalone mode
                return Observable.zip(
                    this._cacheService.postArm(`${this._resourceId}/config/appSettings/list`, true),
                    this._cacheService.postArm(`${this._resourceId}/config/connectionstrings/list`, true),
                    (a, c) => ({ appSettingResponse: a, connectionStringResponse: c }));
            })
            .do(null, error => {
                this._aiService.trackEvent('/errors/site-config', error);
                this._busyManager.clearBusy();
            })
            .retry()
            .subscribe(r => {
                this._busyManager.clearBusy();
                this._appSettingsArm = r.appSettingResponse.json();
                this._connectionStringsArm = r.connectionStringResponse.json();

                this._setupForm(this._appSettingsArm, this._connectionStringsArm);
            });
    }

    private _setupForm(appSettingsArm: ArmObj<any>, connectionStringsArm: ArmObj<ConnectionStrings>) {
        const appSettings = this._fb.array([]);
        const connectionStrings = this._fb.array([]);

        this._requiredValidator = new RequiredValidator(this._translateService);
        this._uniqueAppSettingValidator = new UniqueValidator(
            'name',
            appSettings,
            this._translateService.instant(PortalResources.validation_duplicateError));

        this._uniqueCsValidator = new UniqueValidator(
            'name',
            connectionStrings,
            this._translateService.instant(PortalResources.validation_duplicateError));

        for (const name in appSettingsArm.properties) {
            if (appSettingsArm.properties.hasOwnProperty(name)) {

                appSettings.push(this._fb.group({
                    name: [
                        name,
                        Validators.compose([
                            this._requiredValidator.validate.bind(this._requiredValidator),
                            this._uniqueAppSettingValidator.validate.bind(this._uniqueAppSettingValidator)])],
                    value: [appSettingsArm.properties[name]]
                }));

            }
        }

        for (const name in connectionStringsArm.properties) {
            if (connectionStringsArm.properties.hasOwnProperty(name)) {

                const connectionString = connectionStringsArm.properties[name];
                const connectionStringDropDownTypes = this._getConnectionStringTypes(connectionString.type);

                const group = this._fb.group({
                    name: [
                        name,
                        Validators.compose([
                            this._requiredValidator.validate.bind(this._requiredValidator),
                            this._uniqueCsValidator.validate.bind(this._uniqueCsValidator)])],
                    value: [connectionString.value],
                    type: [connectionStringDropDownTypes.find(t => t.default).value]
                });

                (<any>group).csTypes = connectionStringDropDownTypes;
                connectionStrings.push(group);
            }
        }

        this.mainForm = this._fb.group({
            appSettings: appSettings,
            connectionStrings: connectionStrings
        });

        this._broadcastService.clearDirtyState(SiteTabIds.config);

        if (this._valueSubscription) {
            this._valueSubscription.unsubscribe();
        }

        this._valueSubscription = this.mainForm.valueChanges.subscribe(() => {
            // There isn't a callback for dirty state on a form, so this is a workaround.
            if (this.mainForm.dirty) {
                this._broadcastService.setDirtyState(SiteTabIds.config);
            }
        });
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

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        this.viewInfoStream.next(viewInfo);
    }

    ngOnDestroy(): void {
        if (this._viewInfoSubscription) {
            this._viewInfoSubscription.unsubscribe();
            this._viewInfoSubscription = null;
        }
        if (this._valueSubscription) {
            this._valueSubscription.unsubscribe();
            this._valueSubscription = null;
        }
        this._broadcastService.clearDirtyState(SiteTabIds.config);
    }

    save() {
        const appSettingGroups = (<FormArray>this.mainForm.controls['appSettings']).controls;
        appSettingGroups.forEach(group => {
            const controls = (<FormGroup>group).controls;
            for (const controlName in controls) {
                const control = <CustomFormControl>controls[controlName];
                control._msRunValidation = true;
                control.updateValueAndValidity();
            }
        });

        const connectionStringGroups = (<FormArray>this.mainForm.controls['connectionStrings']).controls;
        connectionStringGroups.forEach(group => {
            const controls = (<FormGroup>group).controls;
            for (const controlName in controls) {
                const control = <CustomFormControl>controls[controlName];
                control._msRunValidation = true;
                control.updateValueAndValidity();
            }
        });

        if (this.mainForm.valid) {
            const appSettingsArm: ArmObj<any> = JSON.parse(JSON.stringify(this._appSettingsArm));
            delete appSettingsArm.properties;
            appSettingsArm.properties = {};

            for (let i = 0; i < appSettingGroups.length; i++) {
                appSettingsArm.properties[appSettingGroups[i].value.name] = appSettingGroups[i].value.value;
            }

            const connectionStringsArm: ArmObj<any> = JSON.parse(JSON.stringify(this._connectionStringsArm));
            delete connectionStringsArm.properties;
            connectionStringsArm.properties = {};

            for (let i = 0; i < connectionStringGroups.length; i++) {
                const connectionStringControl = connectionStringGroups[i];
                const connectionString = {
                    value: connectionStringControl.value.value,
                    type: ConnectionStringType[connectionStringControl.value.type]
                };

                connectionStringsArm.properties[connectionStringGroups[i].value.name] = connectionString;
            }

            this._busyManager.setBusy();

            Observable.zip(
                this._cacheService.putArm(`${this._resourceId}/config/appSettings`, null, appSettingsArm),
                this._cacheService.putArm(`${this._resourceId}/config/connectionstrings`, null, connectionStringsArm),
                (a, c) => ({ appSettingsResponse: a, connectionStringsResponse: c })
            )
                .subscribe(r => {
                    this._busyManager.clearBusy();
                    this._appSettingsArm = r.appSettingsResponse.json();
                    this._connectionStringsArm = r.connectionStringsResponse.json();
                    this._setupForm(this._appSettingsArm, this._connectionStringsArm);
                });
        }
    }

    discard() {
        this.mainForm.reset();
        this._setupForm(this._appSettingsArm, this._connectionStringsArm);
    }

    deleteAppSetting(group: FormGroup) {
        const appSettings = <FormArray>this.mainForm.controls['appSettings'];
        this._deleteRow(group, appSettings);
    }

    deleteConnectionString(group: FormGroup) {
        const connectionStrings = <FormArray>this.mainForm.controls['connectionStrings'];
        this._deleteRow(group, connectionStrings);
    }

    private _deleteRow(group: FormGroup, formArray: FormArray) {
        const index = formArray.controls.indexOf(group);
        if (index >= 0) {
            formArray.markAsDirty();
            formArray.removeAt(index);
            formArray.updateValueAndValidity();
        }
    }

    addAppSetting() {
        const appSettings = <FormArray>this.mainForm.controls['appSettings'];
        const group = this._fb.group({
            name: [
                null,
                Validators.compose([
                    this._requiredValidator.validate.bind(this._requiredValidator),
                    this._uniqueAppSettingValidator.validate.bind(this._uniqueAppSettingValidator)])],
            value: [null]
        });

        (<CustomFormGroup>group).msStartInEditMode = true;
        appSettings.markAsDirty();
        appSettings.push(group);
    }

    addConnectionString() {
        const connectionStrings = <FormArray>this.mainForm.controls['connectionStrings'];
        const connectionStringDropDownTypes = this._getConnectionStringTypes(ConnectionStringType.SQLAzure);

        const group = this._fb.group({
            name: [
                null,
                Validators.compose([
                    this._requiredValidator.validate.bind(this._requiredValidator),
                    this._uniqueCsValidator.validate.bind(this._uniqueCsValidator)])],
            value: [null],
            type: [connectionStringDropDownTypes.find(t => t.default).value]
        });

        (<CustomFormGroup>group).msStartInEditMode = true;
        (<any>group).csTypes = connectionStringDropDownTypes;
        connectionStrings.markAsDirty();
        connectionStrings.push(group);
    }
}
