import {Component, Input, OnDestroy, OnChanges, SimpleChange} from '@angular/core';
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
export class FunctionMonitorComponent implements OnDestroy, OnChanges {
    @Input() selectedFunction: FunctionInfo;
    public pulseUrl: string;
    public rows: FunctionInvocations[]; // the data for the InvocationsLog table
    private timer: RxSubscription;
    private _functionName: string;
    public successAggregateHeading: string;
    public errorsAggregateHeading: string;
    public successAggregate: string;
    public errorsAggregate: string;

    public columns: any[];

    constructor(
        private _functionsService: FunctionsService,
        private _functionMonitorService: FunctionMonitorService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) { }

    ngOnDestroy() {
        if (this.timer) {
            this.timer.unsubscribe();
            delete this.timer;
        }
    }

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
        let funcName = this.selectedFunction.name;
        this.pulseUrl = `https://support-bay.scm.azurewebsites.net/Support.functionsmetrics/#/${site}/${funcName}`;
        if (this.timer) {
            this.timer.unsubscribe();
            delete this.timer;
        }

        this.timer = Observable.timer(0, 60000) // allow polling of the API
            .concatMap<FunctionInvocations[]>(() =>
                this._functionMonitorService.getInvocationsDataForSelctedFunction(funcName)
            )
            .subscribe(result => {
                this.rows = result;
            });

        this._functionMonitorService.getAggregateErrorsAndInvocationsForSelectedFunction(funcName)
            .subscribe(results => {
                this.successAggregate = typeof results !== "undefined" ? results.successCount.toString() : "No data found"; //TODO: make this a pipe instead?
                this.errorsAggregate = typeof results !== "undefined" ? results.failedCount.toString() : "No data found";
                this._globalStateService.clearBusyState();
            });
    }
}