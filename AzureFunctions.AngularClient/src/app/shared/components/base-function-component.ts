import { ArmSiteDescriptor } from './../resourceDescriptors';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { Observable } from 'rxjs/Observable';
import { TreeViewInfo, SiteData } from 'app/tree-view/models/tree-view-info';
import { FunctionDescriptor } from 'app/shared/resourceDescriptors';
import { FunctionAppContext } from 'app/shared/function-app-context';
import { FunctionInfo } from 'app/shared/models/function-info';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { HttpResult } from 'app/shared/models/http-result';
import { NavigableComponent } from './navigable-component';

type FunctionChangedEventsType = Observable<TreeViewInfo<SiteData> & {
    siteDescriptor: ArmSiteDescriptor;
    functionDescriptor: FunctionDescriptor;
    context: FunctionAppContext;
    functionInfo: HttpResult<FunctionInfo>;
}>;

export abstract class BaseFunctionComponent extends NavigableComponent {
    public context: FunctionAppContext;
    public viewInfo: TreeViewInfo<SiteData>;
    protected functionChangedEvents: FunctionChangedEventsType;

    constructor(componentName: string, broadcastService: BroadcastService, functionAppService: FunctionAppService, setBusy: Function, dashboardType: DashboardType) {
        super(componentName, broadcastService, dashboardType);
        this.functionChangedEvents = this.navigationEvents
            .do(() => setBusy())
            .switchMap(viewInfo => Observable.zip(
                functionAppService.getAppContext(viewInfo.siteDescriptor.getTrimmedResourceId()),
                Observable.of(viewInfo)
            ))
            .switchMap(tuple => Observable.zip(
                functionAppService.getFunction(tuple[0], tuple[1].functionDescriptor.name),
                Observable.of(tuple[0]),
                Observable.of(tuple[1])
            ))
            .map(tuple => Object.assign(tuple[2], {
                context: tuple[1],
                functionInfo: tuple[0]
            }))
            .do(v => {
                this.viewInfo = v;
                this.context = v.context;
            });
    }
}
