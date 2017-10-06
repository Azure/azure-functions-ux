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
import { LogCategories } from 'app/shared/models/constants';
import { LogService } from './../../../shared/services/log.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { CustomFormControl, CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj } from './../../../shared/models/arm/arm-obj';
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

    this._resourceIdStream = new Subject<string>();
    this._resourceIdSubscription = this._resourceIdStream
      .distinctUntilChanged()
      .switchMap(() => {
        this._busyManager.setBusy();
        this._saveError = null;
        this._connectionStringsArm = null;
        this._slotConfigNamesArm = null;
        this.groupArray = null;
        this._resetPermissionsAndLoadingState();
        this._slotConfigNamesArmPath =
          `${SiteDescriptor.getSiteDescriptor(this.resourceId).getSiteOnlyResourceId()}/config/slotConfigNames`;
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
          this.hasWritePermissions ?
            this._cacheService.getArm(this._slotConfigNamesArmPath, true) : Observable.of(null),
          (h, c, s) => ({ hasWritePermissions: h, connectionStringsResponse: c, slotConfigNamesResponse: s })
        )
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
    this.permissionsMessage = "";
    this.showPermissionsMessage = false;
    this.loadingFailureMessage = "";
    this.loadingMessage = this._translateService.instant(PortalResources.loading);
  }

  private _setPermissions(writePermission: boolean, readOnlyLock: boolean) {
    if (!writePermission) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configRequiresWritePermissionOnApp);
    } else if (readOnlyLock) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configDisabledReadOnlyLockOnApp);
    } else {
      this.permissionsMessage = "";
    }

    this.hasWritePermissions = writePermission && !readOnlyLock;
  }

  private _setupForm(connectionStringsArm: ArmObj<ConnectionStrings>, slotConfigNamesArm: ArmObj<SlotConfigNames>) {
    if (!!connectionStringsArm && !!slotConfigNamesArm) {
      if (!this._saveError || !this.groupArray) {
        this.groupArray = this._fb.array([]);

        this._requiredValidator = new RequiredValidator(this._translateService);

        this._uniqueCsValidator = new UniqueValidator(
          "name",
          this.groupArray,
          this._translateService.instant(PortalResources.validation_duplicateError));

        const stickyConnectionStringNames = slotConfigNamesArm.properties.connectionStringNames || [];

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
              type: [connectionStringDropDownTypes.find(t => t.default).value],
              isSlotSetting: [stickyConnectionStringNames.indexOf(name) !== -1]
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

  validate(): SaveOrValidationResult {
    let connectionStringGroups = this.groupArray.controls;
    connectionStringGroups.forEach(group => {
      let controls = (<FormGroup>group).controls;
      for (let controlName in controls) {
        let control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    });

    return {
      success: this.groupArray.valid,
      error: this.groupArray.valid ? null : this._validationFailureMessage()
    };
  }

  save(): Observable<SaveOrValidationResult> {
    let connectionStringGroups = this.groupArray.controls;

    if (this.mainForm.contains("connectionStrings") && this.mainForm.controls["connectionStrings"].valid) {
      let connectionStringsArm: ArmObj<any> = JSON.parse(JSON.stringify(this._connectionStringsArm));
      connectionStringsArm.properties = {};

      let slotConfigNamesArm: ArmObj<any> = JSON.parse(JSON.stringify(this._slotConfigNamesArm));
      delete slotConfigNamesArm.properties.appSettingNames;
      slotConfigNamesArm.properties.connectionStringNames = slotConfigNamesArm.properties.connectionStringNames || [];
      let connectionStringNames = slotConfigNamesArm.properties.connectionStringNames as string[];
      
      // TEMPORARY MITIGATION: Only do PUT on slotConfiNames API if there have been changes.
      let connectionStringNamesModified = false;

      for (let i = 0; i < connectionStringGroups.length; i++) {
        let connectionStringControl = connectionStringGroups[i];
        let connectionString = {
          value: connectionStringControl.value.value,
          type: ConnectionStringType[connectionStringControl.value.type]
        }

        let name = connectionStringGroups[i].value.name;

        connectionStringsArm.properties[name] = connectionString;

        if (connectionStringGroups[i].value.isSlotSetting) {
          if (connectionStringNames.indexOf(name) === -1) {
            connectionStringNames.push(name);
            connectionStringNamesModified = true;
          }
        }
        else {
          let index = connectionStringNames.indexOf(name);
          if (index !== -1) {
            connectionStringNames.splice(index, 1);
            connectionStringNamesModified = true;
          }
        }
      }

      return Observable.zip(
        this._cacheService.putArm(`${this.resourceId}/config/connectionstrings`, null, connectionStringsArm),
        // TEMPORARY MITIGATION: Only do PUT on slotConfiNames API if there have been changes.
        connectionStringNamesModified ? this._cacheService.putArm(this._slotConfigNamesArmPath, null, slotConfigNamesArm): Observable.of(null),
        Observable.of(connectionStringNamesModified),
        (c, s, m) => ({ connectionStringsResponse: c, slotConfigNamesResponse: s, connectionStringNamesModified: m })
      )
        .map(r => {
          this._connectionStringsArm = r.connectionStringsResponse.json();
          this._slotConfigNamesArm = r.connectionStringNamesModified ? r.slotConfigNamesResponse.json() : this._slotConfigNamesArm;
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
      let failureMessage = this._validationFailureMessage();
      this._saveError = failureMessage;
      return Observable.of({
        success: false,
        error: failureMessage
      });
    }
  }

  private _validationFailureMessage(): string {
    const configGroupName = this._translateService.instant(PortalResources.connectionStrings);
    return this._translateService.instant(PortalResources.configUpdateFailureInvalidInput, { configGroupName: configGroupName });
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
      type: [connectionStringDropDownTypes.find(t => t.default).value],
      isSlotSetting: [false]
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