import { Component, Input, Injector, ViewChild } from '@angular/core';
import { ComponentNames } from '../../shared/models/constants';
import { FeatureComponent } from '../../shared/components/feature-component';
import { FunctionMonitorInfo } from '../../shared/models/function-monitor';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { FunctionAppService } from '../../shared/services/function-app.service';
import { FunctionMonitorService } from '../../shared/services/function-monitor.service';
import { TableFunctionMonitorComponent } from '../../table-function-monitor/table-function-monitor.component';

declare const moment: any;

@Component({
    selector: ComponentNames.monitorClassic,
    templateUrl: './monitor-classic.component.html',
    styleUrls: ['./../function-monitor.component.scss', './monitor-classic.component.scss']
})
export class MonitorClassicComponent extends FeatureComponent<FunctionMonitorInfo> {
    @ViewChild(TableFunctionMonitorComponent) tableFunctionMonitorComponent: TableFunctionMonitorComponent;

    @Input() set functionMonitorInfoInput(functionMonitorInfo: FunctionMonitorInfo) {
        this.setBusy();
        this.successAggregate = this.errorsAggregate = this._translateService.instant(PortalResources.functionMonitor_loading);
        this.setInput(functionMonitorInfo);
    }

    public successAggregateHeading: string;
    public errorsAggregateHeading: string;
    public successAggregate: string;
    public errorsAggregate: string;
    public functionId: string;
    public functionMonitorInfo: FunctionMonitorInfo;

    constructor(
        private _translateService: TranslateService,
        private _functionAppService: FunctionAppService,
        private _functionMonitorService: FunctionMonitorService,
        injector: Injector) {
        super(ComponentNames.monitorApplicationInsights, injector, 'dashboard');
        this.featureName = ComponentNames.functionMonitor;
        this._setHeaders();
    }

    protected setup(functionMonitorInfoInputEvent: Observable<FunctionMonitorInfo>) {
        return functionMonitorInfoInputEvent
            .switchMap(functionMonitorInfo => {
                this.functionMonitorInfo = functionMonitorInfo;

                return this._functionAppService
                    .getFunctionHostStatus(functionMonitorInfo.functionAppContext)
                    .flatMap(functionHost => this._functionMonitorService.getDataForSelectedFunction(
                        functionMonitorInfo.functionAppContext,
                        functionMonitorInfo.functionInfo,
                        functionHost.isSuccessful ? functionHost.result.id : ''));
            })
            .do(data => {
                this.functionId = !!data ? data.functionId : '';
                this.successAggregate = !!data ? data.successCount.toString() : this._translateService.instant(PortalResources.appMonitoring_noData);
                this.errorsAggregate = !!data ? data.failedCount.toString() : this._translateService.instant(PortalResources.appMonitoring_noData);
            });
    }

    public refreshMonitorClassicData() {
        this.setInput(this.functionMonitorInfo);
        this.tableFunctionMonitorComponent.refresh();
    }

    private _setHeaders(): void {
        const firstOfMonth = moment().startOf('month');
        this.successAggregateHeading = `${this._translateService.instant(PortalResources.functionMonitor_successAggregate)} ${firstOfMonth.format('MMM Do')}`;
        this.errorsAggregateHeading = `${this._translateService.instant(PortalResources.functionMonitor_errorsAggregate)} ${firstOfMonth.format('MMM Do')}`;
    }
}
