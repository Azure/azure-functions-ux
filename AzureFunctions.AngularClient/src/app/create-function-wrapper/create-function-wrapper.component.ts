import { ExtendedTreeViewInfo } from './../shared/components/navigable-component';
import { FunctionAppService } from './../shared/services/function-app.service';
import { Component, Injector } from '@angular/core';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { ConfigService } from './../shared/services/config.service';
import { Observable } from 'rxjs/Observable';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { NavigableComponent } from '../shared/components/navigable-component';

@Component({
    selector: 'create-function-wrapper',
    templateUrl: './create-function-wrapper.component.html',
    styleUrls: ['./create-function-wrapper.component.scss']
})
export class CreateFunctionWrapperComponent extends NavigableComponent {

    public dashboardType: string;

    constructor(
        private _configService: ConfigService,
        private _functionAppService: FunctionAppService,
        injector: Injector) {
        super('create-function-wrapper', injector, [
            DashboardType.CreateFunctionAutoDetectDashboard,
            DashboardType.CreateFunctionDashboard,
            DashboardType.CreateFunctionQuickstartDashboard
        ]);
    }

    setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
        return super.setup(navigationEvents)
            .switchMap(info => {
                if (info.dashboardType === DashboardType.CreateFunctionDashboard
                    || info.dashboardType === DashboardType.CreateFunctionQuickstartDashboard) {
                    return Observable.of(DashboardType[info.dashboardType]);
                } else {
                    const siteDescriptor = new ArmSiteDescriptor(this.viewInfo.resourceId);
                    return this._functionAppService.getAppContext(siteDescriptor.getTrimmedResourceId())
                        .concatMap(context => this._functionAppService.getFunctions(context))
                        .map(r => {
                            if (r.isSuccessful) {
                                if (r.result.length > 0 || this._configService.isStandalone()) {
                                    return DashboardType[DashboardType.CreateFunctionDashboard];
                                } else {
                                    return DashboardType[DashboardType.CreateFunctionQuickstartDashboard];
                                }
                            } else {
                                return DashboardType[DashboardType.CreateFunctionDashboard];
                            }
                        });
                }
            })
            .do(result => {
                this.dashboardType = result;
            });
    }
}
