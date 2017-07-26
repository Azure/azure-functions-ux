import { ConfigService } from './../shared/services/config.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import { FunctionInfo } from './../shared/models/function-info';
import { AppNode } from './../tree-view/app-node';
import { FunctionsNode } from './../tree-view/functions-node';
import { AiService } from './../shared/services/ai.service';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';
import { DashboardType } from '../tree-view/models/dashboard-type';

@Component({
  selector: 'create-function-wrapper',
  templateUrl: './create-function-wrapper.component.html',
  styleUrls: ['./create-function-wrapper.component.scss'],
  inputs: ['viewInfoInput']
})
export class CreateFunctionWrapperComponent implements OnInit, OnDestroy {

  private _viewInfoStream = new Subject<TreeViewInfo<any>>();
  public dashboardType: string;
  public viewInfo: TreeViewInfo<any>;
  private _subscription: RxSubscription;

  constructor(
    private _aiService: AiService,
    private _configService: ConfigService
  ) {

    let initialDashboardType: DashboardType;

    this._subscription = this._viewInfoStream
      .switchMap(info => {
        this.viewInfo = info;

        if (info.dashboardType === DashboardType.createFunction
          || info.dashboardType === DashboardType.createFunctionQuickstart) {

          this.dashboardType = DashboardType[info.dashboardType];
          return Observable.of(null);
        }

        // Set default for autodetect to CreateFunction while we load function list
        this.dashboardType = DashboardType[DashboardType.createFunction];

        let appNode = <AppNode>info.node.parent;
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
          this.dashboardType = DashboardType[DashboardType.createFunction];
        }
        else {
          this.dashboardType = DashboardType[DashboardType.createFunctionQuickstart];
        }
      });
  }

  set viewInfoInput(viewInfo: TreeViewInfo<any>) {
    this._viewInfoStream.next(viewInfo);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }

  }

}
