import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';








import { AiService } from './../../../shared/services/ai.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { BusyStateComponent } from './../../../busy-state/busy-state.component';
import { TabsComponent } from './../../../tabs/tabs.component';
import { CustomFormGroup, CustomFormControl } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj } from './../../../shared/models/arm/arm-obj';
import { TblItem } from './../../../controls/tbl/tbl.component';
import { CacheService } from './../../../shared/services/cache.service';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss']
})
export class AppSettingsComponent implements OnInit, OnChanges {
  public Resources = PortalResources;
  public groupArray: FormArray;

  public resourceIdStream: Subject<string>;
  private _resourceIdSubscription: RxSubscription;

  private _busyState: BusyStateComponent;
  private _busyStateSubscription: RxSubscription;
  private _busyStateKey: string;

  private _saveError: string;

  private _requiredValidator: RequiredValidator;
  private _uniqueAppSettingValidator: UniqueValidator;

  private _appSettingsArm: ArmObj<any>;








  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _aiService: AiService,
    tabsComponent: TabsComponent
    ) {
      this._busyState = tabsComponent.busyState;
      this._busyStateSubscription = this._busyState.clear.subscribe(event => this._busyStateKey = undefined);

      this.resourceIdStream = new Subject<string>();
      this._resourceIdSubscription = this.resourceIdStream
      .distinctUntilChanged()
      .switchMap(() => {
        this._saveError = null;
        this.setScopedBusyState();
        // Not bothering to check RBAC since this component will only be used in Standalone mode
        return this._cacheService.postArm(`${this.resourceId}/config/appSettings/list`, true);




      })
      .do(null, error => {
        this._aiService.trackEvent("/errors/app-settings", error);
        this._appSettingsArm = null;
        this._setupForm(this._appSettingsArm);
        this.clearScopedBusyState();
      })
      .retry()
      .subscribe(r => {
        this._appSettingsArm = r.json();


        this._setupForm(this._appSettingsArm);
        this.clearScopedBusyState();
      });
  }

  @Input() mainForm: FormGroup;

  @Input() resourceId: string;

  ngOnChanges(changes: SimpleChanges){
    let resourceIdChanged = false;

    if (changes['resourceId']) {
      this.resourceIdStream.next(this.resourceId);
      resourceIdChanged = true;
    }

    if(changes['mainForm'] && !resourceIdChanged)
    {
      this._setupForm(this._appSettingsArm);
    }
  }

  ngOnInit() {
  }

  ngOnDestroy(): void{
    this._resourceIdSubscription.unsubscribe();
    this._busyStateSubscription.unsubscribe();
  }

  private setScopedBusyState(){
    this._busyStateKey = this._busyState.setScopedBusyState(this._busyStateKey);
  }

  private clearScopedBusyState(){
    this._busyState.clearScopedBusyState(this._busyStateKey);
    this._busyStateKey = undefined;
  }

/*
  private setScopedBusyState(){
    this._setScopedBusyState(this._busyStateKey, this._busyState);
  }

  private clearScopedBusyState(){
    this._clearScopedBusyState(this._busyStateKey, this._busyState);
  }

  private _setScopedBusyState(busyStateKey: string, busyState: BusyStateComponent){
    busyStateKey = busyState.setScopedBusyState(busyStateKey);
  }

  private _clearScopedBusyState(busyStateKey: string, busyState: BusyStateComponent){
    busyState.clearScopedBusyState(busyStateKey);
    busyStateKey = undefined;
  }
*/

  private _setupForm(appSettingsArm: ArmObj<any>){
    
    if(!!appSettingsArm){
      if(!this._saveError || !this.groupArray){
        this.groupArray = this._fb.array([]);

        this._requiredValidator = new RequiredValidator(this._translateService);
        this._uniqueAppSettingValidator = new UniqueValidator(
          "name",
          this.groupArray,
          this._translateService.instant(PortalResources.validation_duplicateError));

        for(let name in appSettingsArm.properties){
          if(appSettingsArm.properties.hasOwnProperty(name)){

            this.groupArray.push(this._fb.group({
              name: [
                name,
                Validators.compose([
                  this._requiredValidator.validate.bind(this._requiredValidator),
                  this._uniqueAppSettingValidator.validate.bind(this._uniqueAppSettingValidator)])],
                value: [appSettingsArm.properties[name]]
            }));
          }
        }
      }
      // else{
      //   setTimeout(this.mainForm.markAsDirty(), 0);
      // }

      if(this.mainForm.contains("appSettings")){
        this.mainForm.setControl("appSettings", this.groupArray);
      }
      else{
        this.mainForm.addControl("appSettings", this.groupArray);
      }
    }
    else
    {
      this.groupArray = null;
      if(this.mainForm.contains("appSettings")){
        this.mainForm.removeControl("appSettings");
      }
    }

    this._saveError = null;

  }

  validate(){
    let appSettingGroups = this.groupArray.controls;
    appSettingGroups.forEach(group => {
      let controls = (<FormGroup>group).controls;
      for(let controlName in controls){
        let control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    });
  }

  save() : Observable<boolean>{
    let appSettingGroups = this.groupArray.controls;

    if(this.mainForm.valid){
      let appSettingsArm: ArmObj<any> = JSON.parse(JSON.stringify(this._appSettingsArm));
      delete appSettingsArm.properties;
      appSettingsArm.properties = {};

      for(let i = 0; i < appSettingGroups.length; i++){
        appSettingsArm.properties[appSettingGroups[i].value.name] = appSettingGroups[i].value.value;
      }

      return this._cacheService.putArm(`${this.resourceId}/config/appSettings`, null, appSettingsArm)
      .switchMap(appSettingsResponse => {
        this._appSettingsArm = appSettingsResponse.json();
        return Observable.of(true);
      })
      .catch(error => {
        //this._appSettingsArm = null;
        this._saveError = "Error"; //TODO: Get message from error and display in a notification
        return Observable.of(false);
      });
    }
    else{
      return(Observable.of(false));
    }
  }

  //discard(){
  //  this.groupArray.reset();
  //  this._setupForm(this._appSettingsArm);
  //}

  deleteAppSetting(group: FormGroup){
    let appSettings = this.groupArray;
    this._deleteRow(group, appSettings);
  }

  private _deleteRow(group: FormGroup, formArray: FormArray){
    let index = formArray.controls.indexOf(group);
    if (index >= 0){
      formArray.controls.splice(index, 1);
      group.markAsDirty();
      formArray.updateValueAndValidity();
    }
  }

  addAppSetting(){
    let appSettings = this.groupArray;
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
}
