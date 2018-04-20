import { Component, Input, Injector } from '@angular/core';
import { ComponentNames } from '../../shared/models/constants';
import { FeatureComponent } from '../../shared/components/feature-component';
import { FunctionMonitorInfo, MonitorDetailsInfo } from '../../shared/models/function-monitor';
import { Observable } from 'rxjs/Observable';
import { ApplicationInsightsService } from '../../shared/services/application-insights.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { AIInvocationTrace } from '../../shared/models/application-insights';
import { PortalService } from '../../shared/services/portal.service';
import * as moment from 'moment-mini-ts';

@Component({
    selector: ComponentNames.monitorApplicationInsights,
    templateUrl: './monitor-applicationinsights.component.html',
    styleUrls: ['./../function-monitor.component.scss', './monitor-applicationinsights.component.scss']
})

export class MonitorApplicationInsightsComponent extends FeatureComponent<FunctionMonitorInfo> {

    @Input() set functionMonitorInfoInput(functionMonitorInfo: FunctionMonitorInfo) {
        this.isLoading = true;
        this.successCount = this._translateService.instant(PortalResources.loading);
        this.errorsCount = this._translateService.instant(PortalResources.loading);
        this.applicationInsightsInstanceName = this._translateService.instant(PortalResources.loading);
        this.monitorDetailsInfo = null;
        this.sidePanelOpened = false;
        this.selectedRowId = null;
        this.setInput(functionMonitorInfo);
    }

    public successCount: string;
    public errorsCount: string;
    public applicationInsightsInstanceName: string;
    public functionMonitorInfo: FunctionMonitorInfo;
    public invocationTraces: AIInvocationTrace[] = [];
    public isLoading: boolean = true;
    public monitorDetailsInfo: MonitorDetailsInfo;
    public sidePanelOpened: boolean = false;
    public selectedRowId: string;

    constructor(
        private _portalService: PortalService,
        private _translateService: TranslateService,
        private _applicationInsightsService: ApplicationInsightsService,
        injector: Injector) {
        super(ComponentNames.monitorApplicationInsights, injector, 'dashboard');
        this.featureName = ComponentNames.functionMonitor;
    }

    protected setup(functionMonitorInfoInputEvent: Observable<FunctionMonitorInfo>) {
        return functionMonitorInfoInputEvent
            .switchMap(functionMonitorInfo => Observable.zip(
                Observable.of(functionMonitorInfo),
                this._applicationInsightsService.getLast30DaysSummary(functionMonitorInfo.appInsightsResourceDescriptor.getTrimmedResourceId(), functionMonitorInfo.functionInfo.name),
                this._applicationInsightsService.getInvocationTraces(functionMonitorInfo.appInsightsResourceDescriptor.getTrimmedResourceId(), functionMonitorInfo.functionInfo.name)
            ))
            .do(tuple => {
                this.functionMonitorInfo = tuple[0];
                this.invocationTraces = tuple[2];
                const monthlySummary = tuple[1];
                this.applicationInsightsInstanceName = this.functionMonitorInfo.appInsightsResourceDescriptor.instanceName;

                this.successCount = monthlySummary.successCount.toString();
                this.errorsCount = monthlySummary.failedCount.toString();
                this.isLoading = false;
            });
    }

    public showTraceHistory(trace: AIInvocationTrace): void {
        this.sidePanelOpened = false;
        this.selectedRowId = trace.operationId;
        this.monitorDetailsInfo = {
            functionMonitorInfo: this.functionMonitorInfo,
            operationId: trace.operationId,
            id: trace.id
        };
        this.sidePanelOpened = true;
    }

    public closeSidePanel() {
        this.sidePanelOpened = false;
        this.selectedRowId = null;
    }

    public refresh() {
        this.sidePanelOpened = false;
        this.setInput(this.functionMonitorInfo);
    }

    public openInAppInsights() {
        this._portalService.openBladeDeprecated(
            {
                detailBlade: 'AspNetOverview',
                detailBladeInputs: {
                    id: this.functionMonitorInfo.appInsightsResourceDescriptor.getTrimmedResourceId()
                },
                extension: 'AppInsightsExtension'
            },
            ComponentNames.functionMonitor);
    }

    public openAppInsightsQueryEditor() {
        const url = this._applicationInsightsService.getInvocationTracesDirectUrl(
            this.functionMonitorInfo.appInsightsResourceDescriptor.getResourceIdForDirectUrl(),
            this.functionMonitorInfo.functionInfo.name);

        window.open(url, '_blank');
    }

    public showInterval(timestamp: string): string {
        return moment.utc(timestamp).from(moment.utc());
    }

}
