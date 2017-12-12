import { FunctionsService } from './../shared/services/functions-service';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BroadcastService } from './../shared/services/broadcast.service';
import { ConfigService } from './../shared/services/config.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { FunctionInfo } from './../shared/models/function-info';
import { AiService } from './../shared/services/ai.service';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';

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
    private _broadCastService: BroadcastService,
    private _functionsService: FunctionsService
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

        const siteDescriptor = new ArmSiteDescriptor(this.viewInfo.resourceId);
        return this._functionsService.getAppContext(siteDescriptor.getTrimmedResourceId());
      })
      .switchMap(context => {
        if (!context) {
          return Observable.of(null);
        }

        return this._functionsService.getFunctions(context);
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
        } else {
          this.dashboardType = DashboardType[DashboardType.CreateFunctionQuickstartDashboard];
        }
      });
  }

  ngOnInit() {
    this._broadCastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.TreeNavigation)
      .filter(info => {
        return info.dashboardType === DashboardType.CreateFunctionAutoDetectDashboard
          || info.dashboardType === DashboardType.CreateFunctionDashboard
          || info.dashboardType === DashboardType.CreateFunctionQuickstartDashboard;
      })
      .takeUntil(this._ngUnsubscribe)
      .subscribe(info => {
        this._viewInfoStream.next(info);
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }

}
