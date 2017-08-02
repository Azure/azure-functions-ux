import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { FunctionMonitorService } from '../shared/services/function-monitor.service';
import { FunctionInvocations } from '../shared/models/function-monitor';
import { FunctionInfo } from '../shared/models/function-info';
import { GlobalStateService } from '../shared/services/global-state.service';
import { BusyStateComponent } from '../busy-state/busy-state.component';

@Component({
    selector: 'table-function-monitor',
    templateUrl: './table-function-monitor.component.html',
    styleUrls: ['./table-function-monitor.component.scss'],
})

export class TableFunctionMonitorComponent implements OnChanges {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @Input() columns: any[];
    @Input() data: any[];
    @Input() details: any;
    @Input() invocation: any;
    @Input() pulseUrl: string;
    @Input() selectedFuncId: string;
    @Input() selectedFunction: FunctionInfo;

    public outputLog: string;
    public selectedRowId: string;

    constructor(private _functionMonitorService: FunctionMonitorService,
        public globalStateService: GlobalStateService) { }

    showDetails(rowData: FunctionInvocations) {
        this._functionMonitorService.getInvocationDetailsForSelectedInvocation(this.selectedFunction.functionApp, rowData.id)
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
        this._functionMonitorService.getOutputDetailsForSelectedInvocation(this.selectedFunction.functionApp, rowId)
            .subscribe(outputData => {
                this.outputLog = outputData;
            });
    }

    ngOnChanges() {
        this.details = null;
        this.outputLog = '';
        this.selectedRowId = null;
    }

    refreshFuncMonitorGridData() {
        this.setBusyState();
        this._functionMonitorService.getInvocationsDataForSelectedFunction(this.selectedFunction.functionApp, this.selectedFuncId)
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
}
