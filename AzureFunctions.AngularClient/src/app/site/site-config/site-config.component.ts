import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';

import { BusyStateComponent } from './../../busy-state/busy-state.component';
import { TabsComponent } from './../../tabs/tabs.component';
import { TreeViewInfo } from './../../tree-view/models/tree-view-info';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { ConnectionStringsComponent } from './connection-strings/connection-strings.component';

@Component({
  selector: 'site-config',
  templateUrl: './site-config.component.html',
  styleUrls: ['./site-config.component.scss']
})
export class SiteConfigComponent implements OnDestroy {
  public viewInfoStream: Subject<TreeViewInfo>;

  public mainForm: FormGroup;
  private resourceId: string;

  private _viewInfoSubscription: RxSubscription;
  private _busyState: BusyStateComponent;

  @Input() set viewInfoInput(viewInfo: TreeViewInfo){
      this.viewInfoStream.next(viewInfo);
  }

  @ViewChild(AppSettingsComponent) appSettings : AppSettingsComponent;
  @ViewChild(ConnectionStringsComponent) connectionStrings : ConnectionStringsComponent;

  constructor(
    private _fb: FormBuilder,
    tabsComponent: TabsComponent
    ) {
      this._busyState = tabsComponent.busyState;

      this.viewInfoStream = new Subject<TreeViewInfo>();
      this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .subscribe(viewInfo => {
        this.resourceId = viewInfo.resourceId;
        this.mainForm = this._fb.group({});
        return Observable.of(viewInfo);
        // Not bothering to check RBAC since this component will only be used in Standalone mode
      });
  }

  ngOnDestroy(): void{
    this._viewInfoSubscription.unsubscribe();
  }

  save(){
    this.appSettings.validate();
    this.connectionStrings.validate();

    this._busyState.setBusyState();
    Observable.zip(
      this.appSettings.save(),
      this.connectionStrings.save(),
      (a, c) => ({appSettingsSaved: a, connectionStringsSaved: c})
    )
    .subscribe(r => {
      this._busyState.clearBusyState();
      this.mainForm = this._fb.group({});
      if(!r.appSettingsSaved || !r.connectionStringsSaved){
        this.mainForm.markAsDirty();
      }
    });
  }

  discard(){
    this.mainForm = this._fb.group({});
  }
}
