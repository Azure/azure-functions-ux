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
    private _portalService: PortalService,
    tabsComponent: TabsComponent
    ) {
      this._busyState = tabsComponent.busyState;

      this.viewInfoStream = new Subject<TreeViewInfo>();
      this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .subscribe(viewInfo => {
        this.resourceId = viewInfo.resourceId;
        this.mainForm = this._fb.group({});
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

      let saveResults: string[] = [r.appSettingsResult, r.connectionStringsResult];
      let saveFailures: string[] = saveResults.filter(r => r != "OK");
      let saveSuccess: boolean = !saveFailures.length || saveFailures.length == 0;
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
