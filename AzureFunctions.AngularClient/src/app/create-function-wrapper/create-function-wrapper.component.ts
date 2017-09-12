import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BroadcastService } from './../shared/services/broadcast.service';
import { ConfigService } from './../shared/services/config.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { FunctionInfo } from './../shared/models/function-info';
import { AppNode } from './../tree-view/app-node';
import { AiService } from './../shared/services/ai.service';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';
import { DashboardType } from '../tree-view/models/dashboard-type';

@Component({
  selector: 'create-function-wrapper',
  templateUrl: './create-function-wrapper.component.html',
  styleUrls: ['./create-function-wrapper.component.scss']
})
export class CreateFunctionWrapperComponent implements OnInit, OnDestroy {

  private _viewInfoStream = new Subject<TreeViewInfo<any>>();
  public dashboardType: string;
  public viewInfo: TreeViewInfo<any>;
  private _ngUnsubscribe = new Subject<void>();

  constructor(
    private _aiService: AiService,
    private _configService: ConfigService,
    private _broadCastService: BroadcastService
  ) {

    this._viewInfoStream
      .takeUntil(this._ngUnsubscribe)
      .switchMap(info => {
        this.viewInfo = info;

        if (info.dashboardType === DashboardType.CreateFunctionDashboard
          || info.dashboardType === DashboardType.CreateFunctionQuickstartDashboard) {

          this.dashboardType = DashboardType[info.dashboardType];
          return Observable.of(null);
        }

        // Set default for autodetect to CreateFunction while we load function list
        this.dashboardType = DashboardType[DashboardType.CreateFunctionDashboard];

        const appNode = <AppNode>info.node.parent;
        return appNode.functionAppStream;
      })
      .switchMap(functionApp => {
        if (!functionApp) {
          return Observable.of(null);
        }

        return functionApp.getFunctions();
      })
      .do(null, e => {
        this._aiService.trackException(e, '/errors/create-function-wrapper');
      })
      .retry()
      .subscribe((fcs: FunctionInfo[]) => {
        if (!fcs) {
          return;
        }

        if (fcs.length > 0 || this._configService.isStandalone()) {
          this.dashboardType = DashboardType[DashboardType.CreateFunctionDashboard];
        }
        else {
          this.dashboardType = DashboardType[DashboardType.CreateFunctionQuickstartDashboard];
        }
      });
  }

  ngOnInit() {
    this._broadCastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.CreateFunctionDashboard)
    .takeUntil(this._ngUnsubscribe)
    .subscribe(info => {
      this._viewInfoStream.next(info);
    });

    this._broadCastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.CreateFunctionAutoDetectDashboard)
    .takeUntil(this._ngUnsubscribe)
    .subscribe(info => {
      this._viewInfoStream.next(info);
    });

    this._broadCastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.CreateFunctionQuickstartDashboard)
    .takeUntil(this._ngUnsubscribe)
    .subscribe(info => {
      this._viewInfoStream.next(info);
    });

  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }

}
