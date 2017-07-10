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
import { PortalService } from './../../shared/services/portal.service';
import { AuthzService } from './../../shared/services/authz.service';
import { AiService } from './../../shared/services/ai.service';

export interface SaveResult {
  success: boolean;
  error?: string;
}

export interface ResourceInfo {
  resourceId: string;
  writePermission: boolean;
  readOnlyLock: boolean
}

@Component({
  selector: 'site-config',
  templateUrl: './site-config.component.html',
  styleUrls: ['./site-config.component.scss']
})
export class SiteConfigComponent implements OnDestroy {
  public viewInfoStream: Subject<TreeViewInfo>;
  private _viewInfoSubscription: RxSubscription;
  public hasWritePermissions: boolean = false;

  public mainForm: FormGroup;
  private resourceInfo: ResourceInfo;

  private _busyState: BusyStateComponent;
 
  private _authZService: AuthzService;

  @Input() set viewInfoInput(viewInfo: TreeViewInfo){
      this.viewInfoStream.next(viewInfo);
  }

  @ViewChild(AppSettingsComponent) appSettings : AppSettingsComponent;
  @ViewChild(ConnectionStringsComponent) connectionStrings : ConnectionStringsComponent;

  constructor(
    private _fb: FormBuilder,
    private _portalService: PortalService,
    private _aiService: AiService,
    authZService: AuthzService,
    tabsComponent: TabsComponent
    ) {
      this._busyState = tabsComponent.busyState;
      
      this._authZService = authZService;

      this.viewInfoStream = new Subject<TreeViewInfo>();
      this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .switchMap(viewInfo => {
        this._busyState.setBusyState();
         return Observable.zip(
           Observable.of(viewInfo.resourceId),
           this._authZService.hasPermission(viewInfo.resourceId, [AuthzService.writeScope], true),
           this._authZService.hasReadOnlyLock(viewInfo.resourceId, true),
           (r, wp, rl) => ({resourceId: r, writePermission: wp, readOnlyLock: rl})
         )
       })
      .do(null, error => {
        this.resourceInfo = null;
        this.mainForm = this._fb.group({});
        (<any>this.mainForm).timeStamp = new Date(); //for debugging
        this._aiService.trackEvent("/errors/site-config", error);
        this._busyState.clearBusyState();
      })
      .retry()
      .subscribe(r => {
        this.resourceInfo = {
          resourceId: r.resourceId,
          writePermission: r.writePermission,
          readOnlyLock: r.readOnlyLock
        };
        this.hasWritePermissions = r.writePermission && !r.readOnlyLock;
        this.mainForm = this._fb.group({});
        (<any>this.mainForm).timeStamp = new Date(); //for debugging
        this._busyState.clearBusyState();
      });
  }

  ngOnDestroy(): void{
    this._viewInfoSubscription.unsubscribe();
  }

  save(){
    this.appSettings.validate();
    this.connectionStrings.validate();

    this._busyState.setBusyState();
    let notificationId = null;
    this._portalService.startNotification(
      "Updating web app settings",
      "Updating web app settings")
    .switchMap(s => {
      notificationId = s.id;
      return Observable.zip(
        this.appSettings.save(),
        this.connectionStrings.save(),
        (a, c) => ({appSettingsResult: a, connectionStringsResult: c})
      )
    })
    .subscribe(r => {
      this._busyState.clearBusyState();
      this.mainForm = this._fb.group({});

      const saveResults: SaveResult[] = [r.appSettingsResult, r.connectionStringsResult];
      let saveFailures: string[] = saveResults.filter(r => !r.success).map(r => r.error);
      let saveSuccess: boolean = saveFailures.length == 0;
      let saveNotification = saveSuccess ? "Successfully updated web app settings" : "Failed to update web app settings: " + JSON.stringify(saveFailures);

      if(!saveSuccess){
        this.mainForm.markAsDirty();
      }

      this._portalService.stopNotification(notificationId, saveSuccess, saveNotification);
    });
  }

  discard(){
    this.mainForm = this._fb.group({});
  }
}
