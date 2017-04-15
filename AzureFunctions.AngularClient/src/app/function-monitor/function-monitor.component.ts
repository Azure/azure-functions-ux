import {Component, Input, OnChanges, SimpleChange} from '@angular/core';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import {TranslateService, TranslatePipe} from '@ngx-translate/core';

import {FunctionInfo} from '../shared/models/function-info';
import {FunctionMonitorService} from '../shared/services/function-monitor.service';
import {FunctionInvocations} from '../shared/models/function-monitor';
import {GlobalStateService} from '../shared/services/global-state.service';
import {PortalService} from '../shared/services/portal.service';
import {PortalResources} from '../shared/models/portal-resources';

declare let moment: any;

@Component({
    selector: 'function-monitor',
    templateUrl: './function-monitor.component.html',
    styleUrls: ['./function-monitor.component.css']
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
    public columns: any[];
    public functionId: string;

    constructor(
        private _functionMonitorService: FunctionMonitorService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) { }


    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        this._globalStateService.setBusyState();
        this.successAggregate = this.errorsAggregate = this._translateService.instant(PortalResources.functionMonitor_loading);
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
        let firstOfMonth = moment().startOf('month');
        let site = this.selectedFunction.functionApp.getSiteName();
        this.successAggregateHeading = `${this._translateService.instant(PortalResources.functionMonitor_successAggregate)} ${firstOfMonth.format("MMM Do")}`;
        this.errorsAggregateHeading = `${this._translateService.instant(PortalResources.functionMonitor_errorsAggregate)} ${firstOfMonth.format("MMM Do")}`;
        let host = this.selectedFunction.functionApp.site.name;
        var hostId = !!host ? host : "";
        this._functionMonitorService.getDataForSelectedFunction(this.selectedFunction, hostId).subscribe(data => {
            this.functionId = !!data ? data.functionId : "";
            this.successAggregate = !!data ? data.successCount.toString() :
                this._translateService.instant(PortalResources.appMonitoring_noData);
            this.errorsAggregate = !!data ? data.failedCount.toString() :
                this._translateService.instant(PortalResources.appMonitoring_noData);

            // if no data from function monitoring we don't call the Invocations API since this will return 404
            if (!!data) {
                this._functionMonitorService.getInvocationsDataForSelctedFunction(this.selectedFunction.functionApp, this.functionId).subscribe(result => {
                    this.rows = result;
                    this._globalStateService.clearBusyState();
                });
            } else {
                this._globalStateService.clearBusyState();
            }
        });

        this.pulseUrl = `https://support-bay.scm.azurewebsites.net/Support.functionsmetrics/#/${site}/${this.selectedFunction.name}`;
    }
}
