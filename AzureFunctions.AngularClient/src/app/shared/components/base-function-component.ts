import { Injector } from '@angular/core';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { Observable } from 'rxjs/Observable';
import { FunctionAppContext } from 'app/shared/function-app-context';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { NavigableComponent, ExtendedTreeViewInfo } from './navigable-component';

export abstract class BaseFunctionComponent extends NavigableComponent {
    public context: FunctionAppContext;

    protected _functionAppService: FunctionAppService;

    constructor(componentName: string, injector: Injector, dashboardType: DashboardType) {

        super(componentName, injector, dashboardType);
        this._functionAppService = injector.get(FunctionAppService);
    }

    setup(navigationEvents: Observable<ExtendedTreeViewInfo>) {
        return super.setup(navigationEvents)
            .switchMap(viewInfo => {
                return Observable.zip(
                    this._functionAppService.getAppContext(viewInfo.siteDescriptor.getTrimmedResourceId()),
                    Observable.of(viewInfo));
            })
            .switchMap(tuple => Observable.zip(
                this._functionAppService.getFunction(tuple[0], tuple[1].functionDescriptor.name),
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
