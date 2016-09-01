import {Component, Input, OnChanges, SimpleChange} from '@angular/core';
import {FunctionInfo} from '../models/function-info';
import {FunctionsService} from '../services/functions.service';
import {CORE_DIRECTIVES} from '@angular/common';
import {TableFunctionMonitor} from './table-function-monitor.component';
import {AggregateBlock} from './aggregate-block.component';
import {FunctionMonitorService} from '../services/function-monitor.service';
import {FunctionInvocations} from '../models/function-monitor';
import {Observable, Subscription as RxSubscription} from 'rxjs/Rx';
import {GlobalStateService} from '../services/global-state.service';
import {PortalService} from '../services/portal.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';

@Component({
    selector: 'function-monitor',
    templateUrl: 'templates/function-monitoring.component.html',
    directives: [CORE_DIRECTIVES, TableFunctionMonitor, AggregateBlock],
    pipes: [TranslatePipe]
})
export class FunctionMonitorComponent implements OnChanges {
    @Input() selectedFunction: FunctionInfo;
    public pulseUrl: string;
    public rows: FunctionInvocations[]; // the data for the InvocationsLog table
    private timer: RxSubscription;
    public successAggregateHeading: string;
    public errorsAggregateHeading: string;
    public successAggregate: string;
    public errorsAggregate: string;
    public funcName: string;
    public columns: any[];

    constructor(
        private _functionsService: FunctionsService,
        private _functionMonitorService: FunctionMonitorService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) { }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        this._globalStateService.setBusyState();
        this.columns = [
            {
                display: this._translateService.instant(PortalResources.functionMonitorTable_functionColumn), //The display text
                variable: "functionDisplayTitle", //The  key that maps to the data property
                formatTo: "text" // The type data for the column (date converts to fromNow etc)
            },
            {
                display: this._translateService.instant(PortalResources.functionMonitorTable_statusColumn),
                variable: "status",
                formatTo: "icon"
            },
            {
                display: this._translateService.instant(PortalResources.functionMonitorTable_detailsColumn),
                variable: "whenUtc",
                formatTo: "datetime"
            },
            {
                display: this._translateService.instant(PortalResources.functionMonitorTable_durationColumn),
                variable: "duration",
                formatTo: "number"
            }
        ];
        let site = this._functionsService.getSiteName();
        this.successAggregateHeading = this._translateService.instant(PortalResources.functionMonitor_successAggregate);
        this.errorsAggregateHeading = this._translateService.instant(PortalResources.functionMonitor_errorsAggregate);
        this.funcName = this.selectedFunction.name;
        this.pulseUrl = `https://support-bay.scm.azurewebsites.net/Support.functionsmetrics/#/${site}/${this.funcName}`;
        this._functionMonitorService.getAggregateErrorsAndInvocationsForSelectedFunction(this.funcName)
            .subscribe(results => {
                this.successAggregate = !!results ? results.successCount.toString() : "No data found";
                this.errorsAggregate = !!results ? results.failedCount.toString() : "No data found";
                this._globalStateService.clearBusyState();
            });
        this._functionMonitorService.getInvocationsDataForSelctedFunction(this.funcName).subscribe(result => {
            this.rows = result;
        });
    }
}