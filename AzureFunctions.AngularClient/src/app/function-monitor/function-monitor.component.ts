import { ScenarioService } from './../shared/services/scenario/scenario.service';
import { LogCategories, ScenarioIds } from './../shared/models/constants';
import { Constants } from 'app/shared/models/constants';
import { LogService } from './../shared/services/log.service';
import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';

import { FunctionInfo } from '../shared/models/function-info';
import { FunctionMonitorService } from '../shared/services/function-monitor.service';
import { FunctionInvocations } from '../shared/models/function-monitor';

import { GlobalStateService } from '../shared/services/global-state.service';
import { PortalResources } from '../shared/models/portal-resources';
import { PortalService } from './../shared/services/portal.service';
import { CacheService } from './../shared/services/cache.service';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { Subscription } from 'rxjs/Subscription';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { BaseFunctionComponent } from '../shared/components/base-function-component';

declare const moment: any;

@Component({
    selector: 'function-monitor',
    templateUrl: './function-monitor.component.html',
    styleUrls: ['./function-monitor.component.scss']
})
export class FunctionMonitorComponent extends BaseFunctionComponent {
    public pulseUrl: string;
    public rows: FunctionInvocations[]; // the data for the InvocationsLog table
    public successAggregateHeading: string;
    public errorsAggregateHeading: string;
    public successAggregate: string;
    public errorsAggregate: string;
    public columns: any[];
    public functionId: string;
    public currentFunction: FunctionInfo;
    public aiId: string = null;
    public azureWebJobsDashboardMissed = true;
    public aiNotFound = false;
    public aiEnabled = false;

    constructor(
        public globalStateService: GlobalStateService,
        private _functionMonitorService: FunctionMonitorService,
        private _translateService: TranslateService,
        private _portalService: PortalService,
        private _cacheService: CacheService,
        broadcastService: BroadcastService,
        private _functionAppService: FunctionAppService,
        private _logService: LogService,
        private _scenarioService: ScenarioService
    ) {
        super('function-monitor', broadcastService, _functionAppService, () => globalStateService.setBusyState(), DashboardType.FunctionMonitorDashboard);
        this.columns = [
            {
                display: this._translateService.instant(PortalResources.functionMonitorTable_functionColumn), // The display text
                variable: 'functionDisplayTitle', // The  key that maps to the data property
                formatTo: 'text' // The type data for the column (date converts to fromNow etc)
            },
            {
                display: this._translateService.instant(PortalResources.functionMonitorTable_statusColumn),
                variable: 'status',
                formatTo: 'icon'
            },
            {
                display: this._translateService.instant(PortalResources.functionMonitorTable_detailsColumn),
                variable: 'whenUtc',
                formatTo: 'datetime'
            },
            {
                display: this._translateService.instant(PortalResources.functionMonitorTable_durationColumn),
                variable: 'duration',
                formatTo: 'number'
            }
        ];
    }

    setupNavigation(): Subscription {
        return this.functionChangedEvents
            .switchMap(fi => {
                this.currentFunction = fi.functionInfo.result;
                this.globalStateService.setBusyState();

                this.aiEnabled = this._scenarioService.checkScenario(ScenarioIds.enableAppInsights).status !== 'disabled';

                return Observable.zip(
                    this._cacheService.postArm(`${this.context.site.id}/config/appsettings/list`, true),
                    this.aiEnabled ? this._functionAppService.isAppInsightsEnabled(this.context.site.id) : Observable.of(null));
            })
            .switchMap(r => {
                const appSettings = r[0].json();
                this.aiId = r[1] || '';

                // In case App Insight is located in another subscription show warning
                this.aiNotFound = !this.aiId && appSettings.properties[Constants.instrumentationKeySettingName];

                if (!appSettings.properties[Constants.azureWebJobsDashboardSettingsName]) {
                    this.azureWebJobsDashboardMissed = true;
                    if (this.aiId) {
                        this.openAppInsigthsBlade();
                    }
                    return Observable.of(null);
                } else {
                    this.azureWebJobsDashboardMissed = false;
                }

                // reset rows
                this.rows = [];

                this.successAggregate = this.errorsAggregate = this._translateService.instant(PortalResources.functionMonitor_loading);

                const firstOfMonth = moment().startOf('month');
                this.successAggregateHeading = `${this._translateService.instant(PortalResources.functionMonitor_successAggregate)} ${firstOfMonth.format('MMM Do')}`;
                this.errorsAggregateHeading = `${this._translateService.instant(PortalResources.functionMonitor_errorsAggregate)} ${firstOfMonth.format('MMM Do')}`;

                return this._functionAppService.getFunctionHostStatus(this.context)
                    .flatMap(host => this._functionMonitorService.getDataForSelectedFunction(this.context, this.currentFunction, host.isSuccessful ? host.result.id : ''))
                    .flatMap(data => {
                        this.functionId = !!data ? data.functionId : '';
                        this.successAggregate = !!data ? data.successCount.toString() : this._translateService.instant(PortalResources.appMonitoring_noData);
                        this.errorsAggregate = !!data ? data.failedCount.toString() : this._translateService.instant(PortalResources.appMonitoring_noData);
                        return !!data
                            ? this._functionMonitorService.getInvocationsDataForSelectedFunction(this.context, this.functionId)
                            : Observable.of([]);
                    });
            })
            .do(null, (e) => {
                this._logService.error(LogCategories.FunctionMonitor, '/function-monitor/selected-function-stream', e);
                this.globalStateService.clearBusyState();
            })
            .subscribe(result => {
                this.globalStateService.clearBusyState();
                if (result) {
                    this.rows = result;
                }
            }, null, () => this.globalStateService.clearBusyState());
    }

    openAppInsigthsBlade() {
        this._portalService.openBlade(
            {
                detailBlade: 'AspNetOverview',
                detailBladeInputs: {
                    id: this.aiId
                },
                extension: 'AppInsightsExtension'
            },
            'monitor'
        );
    }
}
