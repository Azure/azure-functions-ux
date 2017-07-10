import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { SaveResult, ResourceInfo } from './../site-config.component';
import { AiService } from './../../../shared/services/ai.service';
import { PortalResources } from './../../../shared/models/portal-resources';
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
  selector: 'app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss']
})
export class AppSettingsComponent implements OnChanges, OnDestroy {
  public debug = false; //for debugging

  public Resources = PortalResources;
  public groupArray: FormArray;

  private _resourceInfoStream: Subject<ResourceInfo>;
  private _resourceInfoSubscription: RxSubscription;
  public hasWritePermissions: boolean = true;

  private _busyState: BusyStateComponent;
  private _busyStateScopeManager: BusyStateScopeManager;

  private _saveError: string;

  private _requiredValidator: RequiredValidator;
  private _uniqueAppSettingValidator: UniqueValidator;

  private _appSettingsArm: ArmObj<any>;

  @Input() mainForm: FormGroup;

  @Input() resourceInfo: ResourceInfo;

  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _aiService: AiService,
    tabsComponent: TabsComponent
    ) {
      this._busyState = tabsComponent.busyState;
      this._busyStateScopeManager = this._busyState.getScopeManager();

      this._resourceInfoStream = new Subject<ResourceInfo>();
      this._resourceInfoSubscription = this._resourceInfoStream
      .distinctUntilChanged()
      .switchMap(() => {
        this._saveError = null;
        this._busyStateScopeManager.setBusy();
        return this._cacheService.postArm(`${this.resourceInfo.resourceId}/config/appSettings/list`, true);
      })
      .do(null, error => {
        this._aiService.trackEvent("/errors/app-settings", error);
        this._appSettingsArm = null;
        this._setupForm(this._appSettingsArm);
        this._busyStateScopeManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        this._appSettingsArm = r.json();
        this._setupForm(this._appSettingsArm);
        this._busyStateScopeManager.clearBusy();
      });
  }

  ngOnChanges(changes: SimpleChanges){
    if (changes['resourceInfo']){
      this._resourceInfoStream.next(this.resourceInfo);
      this.hasWritePermissions = this.resourceInfo.writePermission && !this.resourceInfo.readOnlyLock;
    }
    if(changes['mainForm'] && !changes['resourceInfo']){
      this._setupForm(this._appSettingsArm);
    }
  }

  ngOnDestroy(): void{
    this._resourceInfoSubscription.unsubscribe();
    this._busyStateScopeManager.dispose();
  }

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

  save() : Observable<SaveResult>{
    let appSettingGroups = this.groupArray.controls;

    if(this.mainForm.valid){
      let appSettingsArm: ArmObj<any> = JSON.parse(JSON.stringify(this._appSettingsArm));
      appSettingsArm.properties = {};

      for(let i = 0; i < appSettingGroups.length; i++){
        appSettingsArm.properties[appSettingGroups[i].value.name] = appSettingGroups[i].value.value;
      }

      return this._cacheService.putArm(`${this.resourceInfo.resourceId}/config/appSettings`, null, appSettingsArm)
      .map(appSettingsResponse => {
        this._appSettingsArm = appSettingsResponse.json();
        return {
          success: true,
          error: null
        };
      })
      .catch(error => {
        //this._appSettingsArm = null;
        this._saveError = error._body;
        return Observable.of({
          success: false,
          error: error._body
        });
      });
    }
    else{
      return Observable.of({
        success: false,
        error: "Failed to save App Settings due to invalid input."
      });
    }
  }

  //discard(){
  //  this.groupArray.reset();
  //  this._setupForm(this._appSettingsArm);
  //}

  deleteAppSetting(group: FormGroup){
    let appSettings = this.groupArray;
    let index = appSettings.controls.indexOf(group);
    if (index >= 0){
      appSettings.controls.splice(index, 1);
      group.markAsDirty();
      appSettings.updateValueAndValidity();
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
