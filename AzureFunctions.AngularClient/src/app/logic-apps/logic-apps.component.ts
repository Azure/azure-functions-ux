import { TableItem } from './../controls/tbl/tbl.component';
import { Input } from "@angular/core";
// import { ArmObj } from './../shared/models/arm/arm-obj';
// import { FunctionApp } from './../shared/function-app';
// import { Observable } from 'rxjs/Observable';
import { Subscription as RxSubscription } from "rxjs/Subscription";
import { Subject } from "rxjs/Subject";
import { TreeViewInfo, SiteData } from "./../tree-view/models/tree-view-info";
import { AppNode } from "./../tree-view/app-node";
import { BusyStateComponent } from "./../busy-state/busy-state.component";
import { SiteTabComponent } from "./../site/site-dashboard/site-tab/site-tab.component";
import { TranslateService } from '@ngx-translate/core';
// import { BroadcastService } from './../shared/services/broadcast.service';
import { CacheService } from "./../shared/services/cache.service";
import { PortalService } from "./../shared/services/portal.service";
import { AiService } from "./../shared/services/ai.service";
import { Component, OnInit } from '@angular/core';


export interface LogicAppTableItem extends TableItem {
  title: string;
  id: string;
  resourceGroup: string;
  location: string;
}

@Component({
  selector: 'app-logic-apps',
  templateUrl: './logic-apps.component.html',
  styleUrls: ['./logic-apps.component.scss']
})
export class LogicAppsComponent implements OnInit {
  private _viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
  private _viewInfo: TreeViewInfo<SiteData>;
  private _viewInfoSub: RxSubscription;
  private _appNode: AppNode;
  private _busyState: BusyStateComponent;

  public tableItems: TableItem[] = [];
  public hasLogicApps: Boolean;
  public subId: string;
  public logicAppsIcon = 'images/logicapp.svg';
  public initialized = false;

  @Input()
  set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this._viewInfoStream.next(viewInfo);
  }

  constructor(
    // private _armService: ArmService,
    private _aiService: AiService,
    private _portalService: PortalService,
    private _cacheService: CacheService,
    // private _broadcastService: BroadcastService,
    private _translateService: TranslateService,
    siteTabComponent: SiteTabComponent
  ) {
    this._busyState = siteTabComponent.busyState;

    this._viewInfoSub = this._viewInfoStream
      .switchMap(viewInfo => {
        this._viewInfo = viewInfo;
        this._busyState.setBusyState();
        this.initialized = false;

        this._appNode = <AppNode>viewInfo.node;
        this.subId = this._appNode.subscriptionId;

        return this._cacheService.getArm(
          `/subscriptions/${this.subId}/providers/Microsoft.Logic/workflows`,
          true,
          '2016-06-01',
          true
        );
      })
      .do(null, e => {
        this._aiService.trackException(e, 'logic-apps');
      })
      .retry()
      .subscribe(r => {
        this.tableItems = r.json().value
          .map(app => (<LogicAppTableItem>{
            title: app.name,
            id: app.id,
            resourceGroup: app.id.split('/')[4],
            location:  this._translateService.instant(app.location),
            type: 'row'
          }));

        this.hasLogicApps = this.tableItems.length > 0;
        this._busyState.clearBusyState();
        this.initialized = true;
      });
  }

  ngOnInit() {}

  clickRow(item: LogicAppTableItem) {
    this._portalService.openBlade(
      {
        detailBlade: 'LogicAppsDesignerBlade',
        detailBladeInputs: {
          id: item.id
        },
        extension: 'Microsoft_Azure_EMA'
      },
      'LogicAppsComponent'
    );
  }
}
