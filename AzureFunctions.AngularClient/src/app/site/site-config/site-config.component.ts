import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { AiService } from './../../shared/services/ai.service';
import { PortalResources } from './../../shared/models/portal-resources';
import { EnumEx } from './../../shared/Utilities/enumEx';
import { DropDownElement } from './../../shared/models/drop-down-element';
import { ConnectionStrings, ConnectionStringType } from './../../shared/models/arm/connection-strings';
import { BusyStateComponent } from './../../busy-state/busy-state.component';
import { TabsComponent } from './../../tabs/tabs.component';
import { CustomFormGroup, CustomFormControl } from './../../controls/click-to-edit/click-to-edit.component';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { TblItem } from './../../controls/tbl/tbl.component';
import { CacheService } from './../../shared/services/cache.service';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';

@Component({
  selector: 'site-config',
  templateUrl: './site-config.component.html',
  styleUrls: ['./site-config.component.scss']
})
export class SiteConfigComponent implements OnInit {
  public viewInfoStream: Subject<TreeViewInfo<SiteData>>;

  public mainForm: FormGroup;
  public connectionStringTypes: DropDownElement<ConnectionStringType>[];
  public Resources = PortalResources;

  private _viewInfoSubscription: RxSubscription;
  private _appSettingsArm: ArmObj<any>;
  private _connectionStringsArm: ArmObj<ConnectionStrings>;
  private _busyState: BusyStateComponent;
  private _resourceId: string;

  private _requiredValidator: RequiredValidator;
  private _uniqueAppSettingValidator: UniqueValidator;
  private _uniqueCsValidator: UniqueValidator;

  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _aiService: AiService,
    tabsComponent: TabsComponent
  ) {
    this._busyState = tabsComponent.busyState;

    this.viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
    this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .switchMap(viewInfo => {
        this._busyState.setBusyState();
        this._resourceId = viewInfo.resourceId;

        // Not bothering to check RBAC since this component will only be used in Standalone mode
        return Observable.zip(
          this._cacheService.postArm(`${this._resourceId}/config/appSettings/list`, true),
          this._cacheService.postArm(`${this._resourceId}/config/connectionstrings/list`, true),
          (a, c) => ({ appSettingResponse: a, connectionStringResponse: c })
        )
      })
      .do(null, error => {
        this._aiService.trackEvent("/errors/site-config", error);
        this._busyState.clearBusyState();
      })
      .retry()
      .subscribe(r => {
        this._busyState.clearBusyState();
        this._appSettingsArm = r.appSettingResponse.json();
        this._connectionStringsArm = r.connectionStringResponse.json();

        this._setupForm(this._appSettingsArm, this._connectionStringsArm);
      });
  }

  private _setupForm(appSettingsArm: ArmObj<any>, connectionStringsArm: ArmObj<ConnectionStrings>) {
    let appSettings = this._fb.array([]);
    let connectionStrings = this._fb.array([]);

    this._requiredValidator = new RequiredValidator(this._translateService);
    this._uniqueAppSettingValidator = new UniqueValidator(
      "name",
      appSettings,
      this._translateService.instant(PortalResources.validation_duplicateError));

    this._uniqueCsValidator = new UniqueValidator(
      "name",
      connectionStrings,
      this._translateService.instant(PortalResources.validation_duplicateError));

    for (let name in appSettingsArm.properties) {
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

    for (let name in connectionStringsArm.properties) {
      if (connectionStringsArm.properties.hasOwnProperty(name)) {

        let connectionString = connectionStringsArm.properties[name];
        let connectionStringDropDownTypes = this._getConnectionStringTypes(connectionString.type);

        let group = this._fb.group({
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
    })
  }

  private _getConnectionStringTypes(defaultType: ConnectionStringType) {
    let connectionStringDropDownTypes: DropDownElement<string>[] = []

    EnumEx.getNamesAndValues(ConnectionStringType).forEach(pair => {
      connectionStringDropDownTypes.push({
        displayLabel: pair.name,
        value: pair.name,
        default: pair.value === defaultType
      })
    })

    return connectionStringDropDownTypes;
  }

  @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this.viewInfoStream.next(viewInfo);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this._viewInfoSubscription.unsubscribe();
  }

  save() {
    let appSettingGroups = (<FormArray>this.mainForm.controls["appSettings"]).controls;
    appSettingGroups.forEach(group => {
      let controls = (<FormGroup>group).controls;
      for (let controlName in controls) {
        let control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    });

    let connectionStringGroups = (<FormArray>this.mainForm.controls["connectionStrings"]).controls;
    connectionStringGroups.forEach(group => {
      let controls = (<FormGroup>group).controls;
      for (let controlName in controls) {
        let control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    });

    if (this.mainForm.valid) {
      let appSettingsArm: ArmObj<any> = JSON.parse(JSON.stringify(this._appSettingsArm));
      delete appSettingsArm.properties;
      appSettingsArm.properties = {};

      for (let i = 0; i < appSettingGroups.length; i++) {
        appSettingsArm.properties[appSettingGroups[i].value.name] = appSettingGroups[i].value.value;
      }

      let connectionStringsArm: ArmObj<any> = JSON.parse(JSON.stringify(this._connectionStringsArm));
      delete connectionStringsArm.properties;
      connectionStringsArm.properties = {};

      for (let i = 0; i < connectionStringGroups.length; i++) {
        let connectionStringControl = connectionStringGroups[i];
        let connectionString = {
          value: connectionStringControl.value.value,
          type: ConnectionStringType[connectionStringControl.value.type]
        }

        connectionStringsArm.properties[connectionStringGroups[i].value.name] = connectionString;
      }

      this._busyState.setBusyState();

      Observable.zip(
        this._cacheService.putArm(`${this._resourceId}/config/appSettings`, null, appSettingsArm),
        this._cacheService.putArm(`${this._resourceId}/config/connectionstrings`, null, connectionStringsArm),
        (a, c) => ({ appSettingsResponse: a, connectionStringsResponse: c })
      )
        .subscribe(r => {
          this._busyState.clearBusyState();
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
    let appSettings = <FormArray>this.mainForm.controls["appSettings"];
    this._deleteRow(group, appSettings);
  }

  deleteConnectionString(group: FormGroup) {
    let connectionStrings = <FormArray>this.mainForm.controls["connectionStrings"];
    this._deleteRow(group, connectionStrings);
  }

  private _deleteRow(group: FormGroup, formArray: FormArray) {
    let index = formArray.controls.indexOf(group);
    if (index >= 0) {
      formArray.controls.splice(index, 1);
      group.markAsDirty();
    }
  }

  addAppSetting() {
    let appSettings = <FormArray>this.mainForm.controls["appSettings"];
    let group = this._fb.group({
      name: [
        null,
        Validators.compose([
          this._requiredValidator.validate.bind(this._requiredValidator),
          this._uniqueAppSettingValidator.validate.bind(this._uniqueAppSettingValidator)])],
      value: [null]
    });

    (<CustomFormGroup>group)._msStartInEditMode = true;
    appSettings.push(group);
    this.mainForm.markAsDirty();
  }

  addConnectionString() {

    let connectionStrings = <FormArray>this.mainForm.controls["connectionStrings"];
    let connectionStringDropDownTypes = this._getConnectionStringTypes(ConnectionStringType.SQLAzure);

    let group = this._fb.group({
      name: [
        null,
        Validators.compose([
          this._requiredValidator.validate.bind(this._requiredValidator),
          this._uniqueCsValidator.validate.bind(this._uniqueCsValidator)])],
      value: [null],
      type: [connectionStringDropDownTypes.find(t => t.default).value]
    });

    (<any>group).csTypes = connectionStringDropDownTypes;
    connectionStrings.push(group);

    (<CustomFormGroup>group)._msStartInEditMode = true;

    this.mainForm.markAsDirty();
  }
}
