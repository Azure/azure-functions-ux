import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { Component, Input, ViewChild, Output } from '@angular/core';
import { FunctionMonitorService } from '../shared/services/function-monitor.service';
import { FunctionInvocations } from '../shared/models/function-monitor';
import { GlobalStateService } from '../shared/services/global-state.service';
import { BusyStateComponent } from '../busy-state/busy-state.component';
import { Subscription } from 'rxjs/Subscription';
import { BroadcastService } from '../shared/services/broadcast.service';
import { Subject } from 'rxjs/Subject';
import { KeyCodes } from 'app/shared/models/constants';

@Component({
    selector: 'table-function-monitor',
    templateUrl: './table-function-monitor.component.html',
    styleUrls: ['./table-function-monitor.component.scss'],
})

export class TableFunctionMonitorComponent extends FunctionAppContextComponent {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @Input() columns: any[];
    @Input() data: any[];
    @Input() details: any;
    @Input() invocation: any;
    @Input() isAppInsightsConnected: boolean;
    @Input() selectedFuncId: string;
    @Output() openAppInsights = new Subject();

    public outputLog: string;
    public selectedRowId: string;

    constructor(
        private _functionMonitorService: FunctionMonitorService,
        public globalStateService: GlobalStateService,
        functionAppService: FunctionAppService,
        broadcastService: BroadcastService) {
        super('table-function-monitor', functionAppService, broadcastService, () => this.setBusyState());
    }

    setup(): Subscription {
        return this.viewInfoEvents
            .subscribe(view => {
                this.clearBusyState();
                this.details = null;
                this.outputLog = '';
                this.selectedRowId = null;
            });
    }

    showDetails(rowData: FunctionInvocations) {
        this._functionMonitorService.getInvocationDetailsForSelectedInvocation(this.context, rowData.id)
            .subscribe(results => {

                if (!!results) {
                    this.invocation = results.invocation;
                    this.details = results.parameters;
                    this.selectedRowId = rowData.id;
                    this.setOutputLogInfo(this.selectedRowId);
                }
            });
        return this.details;
    }

    setOutputLogInfo(rowId: string) {
        this._functionMonitorService.getOutputDetailsForSelectedInvocation(this.context, rowId)
            .subscribe(outputData => {
                this.outputLog = outputData;
            });
    }

    refreshFuncMonitorGridData() {
        this.setBusyState();
        this._functionMonitorService.getInvocationsDataForSelectedFunction(this.context, this.selectedFuncId)
            .subscribe(result => {
                this.data = result;
                this.clearBusyState();
            });
    }

    setBusyState() {
        if (this.busyState) {
            this.busyState.setBusyState();
        }
    }

    clearBusyState() {
        if (this.busyState) {
            this.busyState.clearBusyState();
        }
    }

    liveStreamCliked() {
        this.openAppInsights.next();
    }

    onKeyPressRefresh(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.enter) {
            this.refreshFuncMonitorGridData();
        }
    }

    onKeyPressLogDetails(event: KeyboardEvent, rowData: FunctionInvocations) {
        if (event.keyCode === KeyCodes.enter) {
            this.showDetails(rowData);
        }
    }
}
