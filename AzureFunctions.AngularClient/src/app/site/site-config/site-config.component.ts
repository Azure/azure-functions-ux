import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';

import { BusyStateComponent } from './../../busy-state/busy-state.component';
import { TabsComponent } from './../../tabs/tabs.component';
import { TreeViewInfo } from './../../tree-view/models/tree-view-info';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { ConnectionStringsComponent } from './connection-strings/connection-strings.component';
import { PortalService } from './../../shared/services/portal.service';
import { AuthzService } from './../../shared/services/authz.service';
import { AiService } from './../../shared/services/ai.service';

export interface SaveResult {
  success: boolean;
  error?: string;
}

@Component({
  selector: 'site-config',
  templateUrl: './site-config.component.html',
  styleUrls: ['./site-config.component.scss']
})
export class SiteConfigComponent implements OnDestroy {
  public debug = false; //for debugging

  public viewInfoStream: Subject<TreeViewInfo>;
  private _viewInfoSubscription: RxSubscription;
  private _writePermission: boolean = true;
  private _readOnlyLock: boolean = false;
  public hasWritePermissions: boolean = true;

  public mainForm: FormGroup;
  private resourceId: string;

  private _busyState: BusyStateComponent;
 
  private _authZService: AuthzService;

  @Input() set viewInfoInput(viewInfo: TreeViewInfo){
      this.viewInfoStream.next(viewInfo);
  }

  @ViewChild(GeneralSettingsComponent) generalSettings : GeneralSettingsComponent;
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
           this._authZService.hasPermission(viewInfo.resourceId, [AuthzService.writeScope]),
           this._authZService.hasReadOnlyLock(viewInfo.resourceId),
           (r, wp, rl) => ({resourceId: r, writePermission: wp, readOnlyLock: rl})
         )
       })
      .do(null, error => {
        this.resourceId = null;
        this.mainForm = this._fb.group({});
        (<any>this.mainForm).timeStamp = new Date(); //for debugging
        this._aiService.trackEvent("/errors/site-config", error);
        this._busyState.clearBusyState();
      })
      .retry()
      .subscribe(r => {
        this._writePermission = r.writePermission;
        this._readOnlyLock = r.readOnlyLock;
        this.hasWritePermissions = r.writePermission && !r.readOnlyLock;
        this.resourceId = r.resourceId;
        this.mainForm = this._fb.group({});
        (<any>this.mainForm).timeStamp = new Date(); //for debugging
        this._busyState.clearBusyState();
      });
  }

  ngOnDestroy(): void{
    this._viewInfoSubscription.unsubscribe();
  }

  save(){
    this.generalSettings.validate();
    this.appSettings.validate();
    this.connectionStrings.validate();

    this._busyState.setBusyState();
    let notificationId = null;
    this._portalService.startNotification(
      "Updating web app settings",
      "Updating web app settings")
    .first()
    .switchMap(s => {
      notificationId = s.id;
      return Observable.zip(
        this.generalSettings.save(),
        this.appSettings.save(),
        this.connectionStrings.save(),
        (g, a, c) => ({generalSettingsResult: g, appSettingsResult: a, connectionStringsResult: c})
      )
    })
    .subscribe(r => {
      this._busyState.clearBusyState();
      this.mainForm = this._fb.group({});
      (<any>this.mainForm).timeStamp = new Date(); //for debugging

      const saveResults: SaveResult[] = [r.generalSettingsResult, r.appSettingsResult, r.connectionStringsResult];
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
    (<any>this.mainForm).timeStamp = new Date(); //for debugging
  }
}
