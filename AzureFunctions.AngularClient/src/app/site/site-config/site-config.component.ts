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

  constructor(
    private _cacheService : CacheService,
    formBuilder : FormBuilder) {

      this.viewInfoStream = new Subject<TreeViewInfo>();
      this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .switchMap(viewInfo =>{
        return this._cacheService.postArm(`${viewInfo.resourceId}/config/appSettings/list`);
      })
      .subscribe(r =>{
        let settingsObj : ArmObj<any> = r.json();

        this.mainForm = formBuilder.group({
          appSettings : formBuilder.array([])
        })

        let appSettings = <FormArray>this.mainForm.controls["appSettings"];
        for(let name in settingsObj.properties){
          if(settingsObj.properties.hasOwnProperty(name)){

              appSettings.push(formBuilder.group({
                  name : [name, CustomValidators.required],
                  value : [settingsObj.properties[name], CustomValidators.required]
                }));
            }
          }
      });
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
    
  }

}
