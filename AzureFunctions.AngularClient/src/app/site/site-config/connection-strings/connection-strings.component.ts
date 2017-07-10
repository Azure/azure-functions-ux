import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { ConnectionStrings, ConnectionStringType } from './../../../shared/models/arm/connection-strings';
import { AiService } from './../../../shared/services/ai.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { EnumEx } from './../../../shared/Utilities/enumEx';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { BusyStateComponent } from './../../../busy-state/busy-state.component';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { TabsComponent } from './../../../tabs/tabs.component';
import { CustomFormControl, CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj } from './../../../shared/models/arm/arm-obj';
import { TblItem } from './../../../controls/tbl/tbl.component';
import { CacheService } from './../../../shared/services/cache.service';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';


@Component({
  selector: 'connection-strings',
  templateUrl: './connection-strings.component.html',
  styleUrls: ['./connection-strings.component.scss']
})
export class ConnectionStringsComponent implements OnChanges, OnDestroy {
  public Resources = PortalResources;
  public groupArray: FormArray;

  private _resourceIdStream: Subject<string>;
  private _resourceIdSubscription: RxSubscription;

  private _busyState: BusyStateComponent;
  private _busyStateScopeManager: BusyStateScopeManager;

  private _saveError: string;

  private _requiredValidator: RequiredValidator;
  private _uniqueCsValidator: UniqueValidator;

  private _connectionStringsArm: ArmObj<ConnectionStrings>;
  public connectionStringTypes: DropDownElement<ConnectionStringType>[];

  @Input() mainForm: FormGroup;

  @Input() resourceId: string;

constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _aiService: AiService,
    tabsComponent: TabsComponent
    ) {
      this._busyState = tabsComponent.busyState;
      this._busyStateScopeManager = this._busyState.getScopeManager();

      this._resourceIdStream = new Subject<string>();

      this._resourceIdSubscription = this._resourceIdStream
      .distinctUntilChanged()
      .switchMap(() => {
        this._saveError = null;
        this._busyStateScopeManager.setBusy();
        // Not bothering to check RBAC since this component will only be used in Standalone mode
        return this._cacheService.postArm(`${this.resourceId}/config/connectionstrings/list`, true);
      })
      .do(null, error => {
        this._aiService.trackEvent("/errors/connection-strings", error);
        this._connectionStringsArm = null;
        this._setupForm(this._connectionStringsArm);
        this._busyStateScopeManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        this._connectionStringsArm = r.json();
        this._setupForm(this._connectionStringsArm);
        this._busyStateScopeManager.clearBusy();
      });
  }

  ngOnChanges(changes: SimpleChanges){
    if (changes['resourceId']){
      this._resourceIdStream.next(this.resourceId);
    }
    if(changes['mainForm'] && !changes['resourceId']){
      this._setupForm(this._connectionStringsArm);
    }
  }

  ngOnDestroy(): void{
    this._resourceIdSubscription.unsubscribe();
    this._busyStateScopeManager.dispose();
  }

  private _setupForm(connectionStringsArm: ArmObj<ConnectionStrings>){
    
    if(!!connectionStringsArm){
      if(!this._saveError || !this.groupArray){
        this.groupArray = this._fb.array([]);

        this._requiredValidator = new RequiredValidator(this._translateService);
    
        this._uniqueCsValidator = new UniqueValidator(
          "name",
          this.groupArray,
          this._translateService.instant(PortalResources.validation_duplicateError));

        for(let name in connectionStringsArm.properties){
          if(connectionStringsArm.properties.hasOwnProperty(name)){

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
      // else{
      //   setTimeout(this.mainForm.markAsDirty(), 0);
      // }

      if(this.mainForm.contains("connectionStrings")){
        this.mainForm.setControl("connectionStrings", this.groupArray);
      }
      else{
        this.mainForm.addControl("connectionStrings", this.groupArray);
      }
    }
    else
    {
      this.groupArray = null;
      if(this.mainForm.contains("connectionStrings")){
        this.mainForm.removeControl("connectionStrings");
      }
    }

    this._saveError = null;

  }

  validate(){
    let connectionStringGroups = this.groupArray.controls;
    connectionStringGroups.forEach(group => {
      let controls = (<FormGroup>group).controls;
      for(let controlName in controls){
        let control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    });
  }

  save() : Observable<string>{
    let connectionStringGroups = this.groupArray.controls;

    if(this.mainForm.valid){
      let connectionStringsArm: ArmObj<any> = JSON.parse(JSON.stringify(this._connectionStringsArm));
      connectionStringsArm.properties = {};

      for(let i = 0; i < connectionStringGroups.length; i++){
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
        return "OK";
      })
      .catch(error => {
        //this._connectionStringsArm = null;
        this._saveError = error._body;
        return Observable.of(error._body);
      });
    }
    else{
      return Observable.of("Failed to save Connection Strings due to invalid input.");
    }
  }

  //discard(){
  //  this.mainForm.controls["connectionStrings"].reset();
  //  this._setupForm(this._connectionStringsArm);
  //}

  deleteConnectionString(group: FormGroup){
    let connectionStrings = this.groupArray;
    let index = connectionStrings.controls.indexOf(group);
    if (index >= 0){
      connectionStrings.controls.splice(index, 1);
      group.markAsDirty();
      connectionStrings.updateValueAndValidity();
    }
  }

  addConnectionString(){
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

    (<any>group).csTypes = connectionStringDropDownTypes;
    connectionStrings.push(group);

    (<CustomFormGroup>group)._msStartInEditMode = true;

    this.mainForm.markAsDirty();
  }

  private _getConnectionStringTypes(defaultType: ConnectionStringType){
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