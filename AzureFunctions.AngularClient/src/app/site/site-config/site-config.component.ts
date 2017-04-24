import { BusyStateComponent } from './../../busy-state/busy-state.component';
import { TabsComponent } from './../../tabs/tabs.component';
import { CustomFormGroup, CustomFormControl } from './../../controls/click-to-edit-textbox/click-to-edit-textbox.component';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { CustomValidators } from './../../shared/customValidators';
import { FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { TblItem } from './../../controls/tbl/tbl.component';
import { CacheService } from './../../shared/services/cache.service';
import { Subject, Observable, Subscription as RxSubscription } from 'rxjs/Rx';
import { TreeViewInfo } from './../../tree-view/models/tree-view-info';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'site-config',
  templateUrl: './site-config.component.html',
  styleUrls: ['./site-config.component.scss'],
  inputs: ['viewInfoInput']  
})
export class SiteConfigComponent implements OnInit {
  public viewInfoStream : Subject<TreeViewInfo>;

  public mainForm : FormGroup;

  private _viewInfoSubscription : RxSubscription;
  private _appSettingsArm : ArmObj<any>;
  private _busyState : BusyStateComponent;
  private _resourceId : string;

  constructor(
    private _cacheService : CacheService,
    private _fb : FormBuilder,
    tabsComponent : TabsComponent
    ) {
      this._busyState = tabsComponent.busyState;

      this.viewInfoStream = new Subject<TreeViewInfo>();
      this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .switchMap(viewInfo =>{
        this._busyState.setBusyState();
        this._resourceId = viewInfo.resourceId;
        return this._cacheService.postArm(`${this._resourceId}/config/appSettings/list`, true);
      })
      .subscribe(r =>{
        this._busyState.clearBusyState();
        this._appSettingsArm = r.json();
        this._setupForm(_fb, this._appSettingsArm);
      });
  }

  private _setupForm(fb : FormBuilder, appSettingsArm : ArmObj<any>){
      this.mainForm = fb.group({
        appSettings : fb.array([])
      })

      let appSettings = <FormArray>this.mainForm.controls["appSettings"];
      for(let name in appSettingsArm.properties){
        if(appSettingsArm.properties.hasOwnProperty(name)){

            appSettings.push(fb.group({
                name : [name, CustomValidators.required],
                value : [appSettingsArm.properties[name]]
              }));
          }
        }
  }

  set viewInfoInput(viewInfo : TreeViewInfo){
      this.viewInfoStream.next(viewInfo);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void{
    this._viewInfoSubscription.unsubscribe();
  }

  save(){
    let appSettingGroups = (<FormArray>this.mainForm.controls["appSettings"]).controls;
    appSettingGroups.forEach(group =>{
      let controls = (<FormGroup>group).controls;
      for(let controlName in controls){
        let control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    });

    if(this.mainForm.valid){
      let appSettingsArm : ArmObj<any> = JSON.parse(JSON.stringify(this._appSettingsArm));
      delete appSettingsArm.properties;
      appSettingsArm.properties = {};

      for(let i = 0; i < appSettingGroups.length; i++){
        appSettingsArm.properties[appSettingGroups[i].value.name] = appSettingGroups[i].value.value;
      }

      this._busyState.setBusyState();
      this._cacheService.putArm(`${this._resourceId}/config/appSettings`, null, appSettingsArm)
      .subscribe(r =>{
        this._busyState.clearBusyState();
        appSettingsArm = r.json();
        this._setupForm(this._fb, appSettingsArm);
      });
    }
  }

  discard(){
    this.mainForm.reset();
    this._setupForm(this._fb, this._appSettingsArm);
  }

  deleteAppSetting(group : FormGroup){
    let appSettings = <FormArray>this.mainForm.controls["appSettings"];
    let index = appSettings.controls.indexOf(group);
    if(index >= 0){
      appSettings.controls.splice(index, 1);
      group.markAsDirty();
    }
  }

  addAppSetting(){
    let appSettings = <FormArray>this.mainForm.controls["appSettings"];
    let group = this._fb.group({
        name : [null, CustomValidators.required],
        value : [null]
      });

    (<CustomFormGroup>group)._msStartInEditMode = true;
    appSettings.push(group);
    this.mainForm.markAsDirty();
  }
}
