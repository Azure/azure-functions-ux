import {Component, Input, OnChanges, SimpleChange, ViewChild} from '@angular/core';
import {FunctionMonitorService} from '../services/function-monitor.service';
import {FunctionInvocations} from '../models/function-monitor';
import {Format} from "../pipes/table-function-monitor.pipe";
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';
import {FunctionInfo} from '../models/function-info';
import {BusyStateComponent} from './busy-state.component';

@Component({
    selector: 'table-function-monitor',
    templateUrl: 'templates/table-function-monitor.html',
    styleUrls: ['styles/table-function-monitor.style.css'],
    pipes: [Format, TranslatePipe],
    directives: [BusyStateComponent]
})

export class TableFunctionMonitor implements OnChanges {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @Input() columns: any[];
    @Input() data: any[];
    @Input() details: any;
    @Input() pulseUrl: string;
    @Input() selectedFuncName: string;

    public outputLog: string;
    public selectedRowId: string;

    constructor(
        private _functionMonitorService: FunctionMonitorService,
        private _translateService: TranslateService) { }

    showDetails(rowData: FunctionInvocations) {
        this._functionMonitorService.getInvocationDetailsForSelectedInvocation(rowData.id).subscribe(results => {
            this.details = results;
            this.selectedRowId = rowData.id;
            this.setOutputLogInfo(this.selectedRowId);
        });
        return this.details;
    }

    setOutputLogInfo(rowId: string) {
        this._functionMonitorService.getOutputDetailsForSelectedInvocation(rowId).subscribe(outputData => {
            this.outputLog = outputData;
        });
    }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        this.details = null;
        this.outputLog = "";
        this.selectedRowId = null;
    }

    refreshFuncMonitorGridData() {
        this.setBusyState();
        this._functionMonitorService.getInvocationsDataForSelctedFunction(this.selectedFuncName).subscribe(result => {
            this.data = result;
            this.clearBusyState();
        });
    }

    setBusyState() {
        if (this.busyState)
            this.busyState.setBusyState();
    }

    clearBusyState() {
        if (this.busyState)
            this.busyState.clearBusyState();
    }
}