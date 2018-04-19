import { Component, Input, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';

import { FunctionInfo } from '../shared/models/function-info';
import { FunctionMonitorService } from '../shared/services/function-monitor.service';
import { FunctionInvocations } from '../shared/models/function-monitor';

import { GlobalStateService } from '../shared/services/global-state.service';
import { PortalResources } from '../shared/models/portal-resources';

declare const moment: any;

@Component({
    selector: 'function-monitor',
    templateUrl: './function-monitor.component.html',
    styleUrls: ['./function-monitor.component.css']
})
export class FunctionMonitorComponent implements OnDestroy {
    public pulseUrl: string;
    public rows: FunctionInvocations[]; // the data for the InvocationsLog table
    public successAggregateHeading: string;
    public errorsAggregateHeading: string;
    public successAggregate: string;
    public errorsAggregate: string;
    public columns: any[];
    public functionId: string;
    public currentFunction: FunctionInfo;
    private selectedFunctionStream: Subject<FunctionInfo>;

    constructor(
        private _functionMonitorService: FunctionMonitorService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) {
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

        this.selectedFunctionStream = new Subject();
        this.selectedFunctionStream
            .switchMap(fi => {
                this._globalStateService.setBusyState();
                // reset rows
                this.rows = [];
                this.currentFunction = fi;

                this.successAggregate = this.errorsAggregate = this._translateService.instant(PortalResources.functionMonitor_loading);
                const site = fi.functionApp.getSiteName();
                this.pulseUrl = `https://support-bay.scm.azurewebsites.net/Support.functionsmetrics/#/${site}/${fi.name}`;

                const firstOfMonth = moment().startOf('month');
                this.successAggregateHeading = `${this._translateService.instant(PortalResources.functionMonitor_successAggregate)} ${firstOfMonth.format('MMM Do')}`;
                this.errorsAggregateHeading = `${this._translateService.instant(PortalResources.functionMonitor_errorsAggregate)} ${firstOfMonth.format('MMM Do')}`;

                return fi.functionApp.getFunctionHostStatus()
                    .flatMap(host => this._functionMonitorService.getDataForSelectedFunction(fi, host.id))
                    .flatMap(data => {
                        this.functionId = !!data ? data.functionId : '';
                        this.successAggregate = !!data ? data.successCount.toString() : this._translateService.instant(PortalResources.appMonitoring_noData);
                        this.errorsAggregate = !!data ? data.failedCount.toString() : this._translateService.instant(PortalResources.appMonitoring_noData);
                        return !!data
                            ? this._functionMonitorService.getInvocationsDataForSelectedFunction(fi.functionApp, this.functionId)
                            : Observable.of([]);
                    });
            })
            .do(null, () => this._globalStateService.clearBusyState())
            .retry()
            .subscribe(result => {
                this.rows = result;
                this._globalStateService.clearBusyState();
            }, null, () => this._globalStateService.clearBusyState());
    }

    @Input() set selectedFunction(value: FunctionInfo) {
        this.selectedFunctionStream.next(value);
    }

    ngOnDestroy() {
        if (this.selectedFunctionStream) {
            this.selectedFunctionStream.complete();
            this.selectedFunctionStream.unsubscribe();
            this.selectedFunctionStream = null;
        }
    }
}
