import { ScenarioService } from './../shared/services/scenario/scenario.service';
import { ScenarioIds } from './../shared/models/constants';
import { ComponentNames } from 'app/shared/models/constants';
import { Component, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { ExtendedTreeViewInfo, NavigableComponent } from '../shared/components/navigable-component';
import { GlobalStateService } from '../shared/services/global-state.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionMonitorInfo } from '../shared/models/function-monitor';

@Component({
    selector: ComponentNames.functionMonitor,
    templateUrl: './function-monitor.component.html',
    styleUrls: ['./function-monitor.component.scss']
})
export class FunctionMonitorComponent extends NavigableComponent {
    private _renderComponentName: string = "";
    public functionMonitorInfo: FunctionMonitorInfo;

    constructor(
        private _functionAppService: FunctionAppService,
        private _scenarioService: ScenarioService,
        public globalStateService: GlobalStateService,
        injector: Injector
    ) {
        super(ComponentNames.functionMonitor, injector, DashboardType.FunctionMonitorDashboard);
        this.featureName = ComponentNames.functionMonitor;
        this.isParentComponent = true;
    }

    setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
        return super
        .setup(navigationEvents)
        .switchMap(viewInfo => Observable.zip(
            this._functionAppService.getAppContext(viewInfo.siteDescriptor.getTrimmedResourceId()),
            Observable.of(viewInfo)
        ))
        .switchMap(tuple => Observable.zip(
            this._functionAppService.getFunction(tuple[0], tuple[1].functionDescriptor.name),
            this._functionAppService.getFunctionAppAzureAppSettings(tuple[0]),
            this._functionAppService.isAppInsightsEnabled(tuple[0].site.id),
            Observable.of(tuple[0]),
            Observable.of(tuple[1])
        ))
        .map((tuple): FunctionMonitorInfo => ({
            functionAppContext: tuple[3],
            functionAppSettings: tuple[1].result.properties,
            functionInfo: tuple[0].result,
            applicationInsightsResourceId: tuple[2]
        }))
        .do(functionMonitorInfo => {
            const aiScenarioEnabled = this._scenarioService.checkScenario(ScenarioIds.enableAppInsights).status !== 'disabled';
            this.functionMonitorInfo = functionMonitorInfo;

            this._renderComponentName = aiScenarioEnabled && functionMonitorInfo.applicationInsightsResourceId !== null
                ? ComponentNames.monitorApplicationInsights
                : ComponentNames.monitorClassic;
        })
    }

    shouldRenderMonitorClassic(): boolean {
        return this._renderComponentName === ComponentNames.monitorClassic;
    }

    shouldRenderMonitorApplicationInsights(): boolean {
        return this._renderComponentName === ComponentNames.monitorApplicationInsights;
    }
}
