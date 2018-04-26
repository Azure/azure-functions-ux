import { ScenarioService } from './../shared/services/scenario/scenario.service';
import { ScenarioIds, Constants } from './../shared/models/constants';
import { ComponentNames } from 'app/shared/models/constants';
import { Component, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { ExtendedTreeViewInfo, NavigableComponent } from '../shared/components/navigable-component';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionMonitorInfo, MonitorConfigureInfo } from '../shared/models/function-monitor';
import { ErrorEvent } from '../shared/models/error-event';
import { errorIds } from '../shared/models/error-ids';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { PortalResources } from '../shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationInsightsService } from '../shared/services/application-insights.service';

@Component({
    selector: ComponentNames.functionMonitor,
    templateUrl: './function-monitor.component.html',
    styleUrls: ['./function-monitor.component.scss']
})
export class FunctionMonitorComponent extends NavigableComponent {
    public static readonly CLASSIC_VIEW = 'classic';

    private _renderComponentName: string = '';
    public functionMonitorInfo: FunctionMonitorInfo;
    public monitorConfigureInfo: MonitorConfigureInfo;

    constructor(
        private _functionAppService: FunctionAppService,
        private _scenarioService: ScenarioService,
        private _translateService: TranslateService,
        private _applicationInsightsService: ApplicationInsightsService,
        injector: Injector
    ) {
        super(ComponentNames.functionMonitor, injector, DashboardType.FunctionMonitorDashboard);
        this.featureName = ComponentNames.functionMonitor;
        this.isParentComponent = true;

        this._broadcastService
            .getEvents<FunctionMonitorInfo>(BroadcastEvent.RefreshMonitoringView)
            .takeUntil(this.ngUnsubscribe)
            .distinctUntilChanged()
            .subscribe(functionMonitorInfo => {
                if (this.viewInfo !== null &&
                    this.functionMonitorInfo !== null &&
                    functionMonitorInfo !== null &&
                    this.functionMonitorInfo.functionAppContext.site.id === functionMonitorInfo.functionAppContext.site.id) {
                    this.setInput(this.viewInfo);
                }
            });
    }

    protected setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
        return super
            .setup(navigationEvents)
            .switchMap(viewInfo => Observable.zip(
                this._functionAppService.getAppContext(viewInfo.siteDescriptor.getTrimmedResourceId()),
                Observable.of(viewInfo)))
            .switchMap(tuple => Observable.zip(
                Observable.of(tuple[0]),
                this._functionAppService.getFunction(tuple[0], tuple[1].functionDescriptor.name),
                this._functionAppService.getFunctionAppAzureAppSettings(tuple[0]),
                this._scenarioService.checkScenarioAsync(ScenarioIds.enableAppInsights, { site: tuple[0].site })
            ))
            .do(tuple => {
                this.functionMonitorInfo = {
                    functionAppContext: tuple[0],
                    functionAppSettings: tuple[2].result.properties,
                    functionInfo: tuple[1].result,
                    appInsightsResourceDescriptor: tuple[3].data
                };

                this._renderComponentName = this._shouldLoadClassicView()
                    ? ComponentNames.monitorClassic
                    : this._shouldLoadApplicationInsightsView()
                        ? ComponentNames.monitorApplicationInsights
                        : this._loadMonitorConfigureView();
            });
    }

    get shouldRenderMonitorClassic(): boolean {
        return this._renderComponentName === ComponentNames.monitorClassic;
    }

    get shouldRenderMonitorApplicationInsights(): boolean {
        return this._renderComponentName === ComponentNames.monitorApplicationInsights;
    }

    get shouldRenderMonitorConfigure(): boolean {
        return this._renderComponentName === ComponentNames.monitorConfigure;
    }

    private _shouldLoadClassicView(): boolean {
        const view: string = this._applicationInsightsService.getFunctionMonitorClassicViewPreference(this.functionMonitorInfo.functionAppContext.site.id);

        return view === FunctionMonitorComponent.CLASSIC_VIEW &&
            !this.functionMonitorInfo.functionAppSettings[Constants.instrumentationKeySettingName];
    }

    private _shouldLoadApplicationInsightsView(): boolean {
        return this.functionMonitorInfo.appInsightsResourceDescriptor !== null;
    }

    private _loadMonitorConfigureView(): string {
        let errorEvent: ErrorEvent = null;

        if (!!this.functionMonitorInfo.functionAppSettings[Constants.instrumentationKeySettingName] &&
            this.functionMonitorInfo.appInsightsResourceDescriptor === null) {
            errorEvent = {
                errorId: errorIds.applicationInsightsInstrumentationKeyMismatch,
                message: this._translateService.instant(PortalResources.monitoring_appInsightsIsNotFound),
                resourceId: this.functionMonitorInfo.functionAppContext.site.id
            };
        }

        this.monitorConfigureInfo = {
            functionMonitorInfo: this.functionMonitorInfo,
            errorEvent: errorEvent
        };

        return ComponentNames.monitorConfigure;
    }
}
