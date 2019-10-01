import { ExtendedTreeViewInfo } from './../shared/components/navigable-component';
import { FunctionAppService } from './../shared/services/function-app.service';
import { Component, Injector } from '@angular/core';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { ConfigService } from './../shared/services/config.service';
import { Observable } from 'rxjs/Observable';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { NavigableComponent } from '../shared/components/navigable-component';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { SiteTabIds } from 'app/shared/models/constants';
import { FunctionService } from 'app/shared/services/function.service';
import { runtimeIsV2, runtimeIsV3 } from 'app/shared/models/functions-version-info';

@Component({
  selector: 'create-function-wrapper',
  templateUrl: './create-function-wrapper.component.html',
  styleUrls: ['./create-function-wrapper.component.scss'],
})
export class CreateFunctionWrapperComponent extends NavigableComponent {
  public dashboardType: string;

  constructor(
    private _configService: ConfigService,
    private _functionAppService: FunctionAppService,
    public broadcastService: BroadcastService,
    private _functionService: FunctionService,
    injector: Injector
  ) {
    super('create-function-wrapper', injector, [
      DashboardType.CreateFunctionAutoDetectDashboard,
      DashboardType.CreateFunctionDashboard,
      DashboardType.CreateFunctionQuickstartDashboard,
    ]);
  }

  setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
    return super
      .setup(navigationEvents)
      .switchMap(info => {
        if (
          info.dashboardType === DashboardType.CreateFunctionDashboard ||
          info.dashboardType === DashboardType.CreateFunctionQuickstartDashboard
        ) {
          return Observable.of(DashboardType[info.dashboardType]);
        } else {
          const siteDescriptor = new ArmSiteDescriptor(this.viewInfo.resourceId);
          return this._functionAppService
            .getAppContext(siteDescriptor.getTrimmedResourceId())
            .switchMap(context => {
              return Observable.zip(
                this._functionService.getFunctions(context.site.id).map(r => (r.isSuccessful ? r.result.value : [])),
                this._functionAppService.getRuntimeGeneration(context),
                (functions, runtime) => ({ functionsInfo: functions, runtimeVersion: runtime })
              );
            })
            .map(r => {
              if (r.functionsInfo.length === 0 && !this._configService.isStandalone()) {
                if (runtimeIsV2(r.runtimeVersion) || runtimeIsV3(r.runtimeVersion)) {
                  this._broadcastService.broadcastEvent(BroadcastEvent.OpenTab, SiteTabIds.quickstart);
                  this._broadcastService.broadcastEvent(BroadcastEvent.TreeUpdate, {
                    operation: 'navigate',
                    data: 'appNode',
                  });
                  return null;
                } else {
                  return DashboardType[DashboardType.CreateFunctionQuickstartDashboard];
                }
              }
              return DashboardType[DashboardType.CreateFunctionDashboard];
            });
        }
      })
      .do(result => {
        this.dashboardType = result;
      });
  }
}
