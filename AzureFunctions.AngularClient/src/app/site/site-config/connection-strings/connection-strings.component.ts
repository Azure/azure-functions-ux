import { SiteTabComponent } from './../../site-dashboard/site-tab/site-tab.component';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { ConnectionStrings, ConnectionStringType } from './../../../shared/models/arm/connection-strings';
import { EnumEx } from './../../../shared/Utilities/enumEx';
import { SaveResult } from './../site-config.component';
import { AiService } from './../../../shared/services/ai.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { BusyStateComponent } from './../../../busy-state/busy-state.component';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { CustomFormControl, CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj } from './../../../shared/models/arm/arm-obj';
import { CacheService } from './../../../shared/services/cache.service';
import { AuthzService } from './../../../shared/services/authz.service';
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

  private _busyState: BusyStateComponent;
  private _busyStateScopeManager: BusyStateScopeManager;

  private _saveError: string;

  private _requiredValidator: RequiredValidator;
  private _uniqueCsValidator: UniqueValidator;

  private _connectionStringsArm: ArmObj<ConnectionStrings>;
  public connectionStringTypes: DropDownElement<ConnectionStringType>[];

  public loadingFailureMessage: string;

  @Input() mainForm: FormGroup;

  @Input() resourceId: string;

  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _aiService: AiService,
    private _authZService: AuthzService,
    siteTabComponent: SiteTabComponent
  ) {
    this._busyState = siteTabComponent.busyState;
    this._busyStateScopeManager = this._busyState.getScopeManager();

    this._resetPermissionsAndLoadingState();

    this._resourceIdStream = new Subject<string>();
    this._resourceIdSubscription = this._resourceIdStream
      .distinctUntilChanged()
      .switchMap(() => {
        this._busyStateScopeManager.setBusy();
        this._saveError = null;
        this._connectionStringsArm = null;
        this.groupArray = null;
        this._resetPermissionsAndLoadingState();
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
            this._cacheService.postArm(`${this.resourceId}/config/connectionstrings/list`, true) : Observable.of(null),
          (h, c) => ({ hasWritePermissions: h, connectionStringsResponse: c })
        )
      })
      .do(null, error => {
        this._aiService.trackEvent("/errors/connection-strings", error);
        this._setupForm(this._connectionStringsArm);
        this.loadingFailureMessage = this._translateService.instant(PortalResources.loading);
        this.showPermissionsMessage = true;
        this._busyStateScopeManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        if (r.hasWritePermissions) {
          this._connectionStringsArm = r.connectionStringsResponse.json();
          this._setupForm(this._connectionStringsArm);
        }
        this.showPermissionsMessage = true;
        this._busyStateScopeManager.clearBusy();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resourceId']) {
      this._resourceIdStream.next(this.resourceId);
    }
    if (changes['mainForm'] && !changes['resourceId']) {
      this._setupForm(this._connectionStringsArm);
    }
  }

  ngOnDestroy(): void {
    if (this._resourceIdSubscription) {
      this._resourceIdSubscription.unsubscribe(); this._resourceIdSubscription = null;
    }
    this._busyStateScopeManager.dispose();
  }

  private _resetPermissionsAndLoadingState() {
    this.hasWritePermissions = true;
    this.permissionsMessage = "";
    this.showPermissionsMessage = false;
    this.loadingFailureMessage = "";
  }

  private _setPermissions(writePermission: boolean, readOnlyLock: boolean) {
    if (!writePermission) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configRequiresWritePermissionOnApp);
    }
    else if (readOnlyLock) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configDisabledReadOnlyLockOnApp);
    }
    else {
      this.permissionsMessage = "";
    }

    this.hasWritePermissions = writePermission && !readOnlyLock;
  }

  private _setupForm(connectionStringsArm: ArmObj<ConnectionStrings>) {
    if (!!connectionStringsArm) {
      if (!this._saveError || !this.groupArray) {
        this.groupArray = this._fb.array([]);

        this._requiredValidator = new RequiredValidator(this._translateService);

        this._uniqueCsValidator = new UniqueValidator(
          "name",
          this.groupArray,
          this._translateService.instant(PortalResources.validation_duplicateError));

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
            this.groupArray.push(group);
          }
        }
      }

      if (this.mainForm.contains("connectionStrings")) {
        this.mainForm.setControl("connectionStrings", this.groupArray);
      }
      else {
        this.mainForm.addControl("connectionStrings", this.groupArray);
      }
    }
    else {
      this.groupArray = null;
      if (this.mainForm.contains("connectionStrings")) {
        this.mainForm.removeControl("connectionStrings");
      }
    }

    this._saveError = null;
  }

  validate() {
    let connectionStringGroups = this.groupArray.controls;
    connectionStringGroups.forEach(group => {
      let controls = (<FormGroup>group).controls;
      for (let controlName in controls) {
        let control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    });
  }

  save(): Observable<SaveResult> {
    let connectionStringGroups = this.groupArray.controls;

    if (this.mainForm.valid) {
      let connectionStringsArm: ArmObj<any> = JSON.parse(JSON.stringify(this._connectionStringsArm));
      connectionStringsArm.properties = {};

      for (let i = 0; i < connectionStringGroups.length; i++) {
        let connectionStringControl = connectionStringGroups[i];
        let connectionString = {
          value: connectionStringControl.value.value,
          type: ConnectionStringType[connectionStringControl.value.type]
        }

        connectionStringsArm.properties[connectionStringGroups[i].value.name] = connectionString;
      }

      return this._cacheService.putArm(`${this.resourceId}/config/connectionstrings`, null, connectionStringsArm)
        .map(connectionStringsResponse => {
          this._connectionStringsArm = connectionStringsResponse.json();
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
    else {
      let configGroupName = this._translateService.instant(PortalResources.connectionStrings);
      let failureMessage = this._translateService.instant(PortalResources.configUpdateFailureInvalidInput, { configGroupName: configGroupName });
      return Observable.of({
        success: false,
        error: failureMessage
      });
    }
  }

  deleteConnectionString(group: FormGroup) {
    let connectionStrings = this.groupArray;
    let index = connectionStrings.controls.indexOf(group);
    if (index >= 0) {
      connectionStrings.markAsDirty();
      connectionStrings.removeAt(index);
      connectionStrings.updateValueAndValidity();
    }
  }

  addConnectionString() {
    let connectionStrings = this.groupArray;
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

    (<CustomFormGroup>group)._msStartInEditMode = true;
    (<any>group).csTypes = connectionStringDropDownTypes;
    connectionStrings.markAsDirty();
    connectionStrings.push(group);
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
}