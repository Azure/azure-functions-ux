import {Component, Input, OnChanges, SimpleChange, ViewChild} from '@angular/core';
import {FunctionMonitorService} from '../services/function-monitor.service';
import {FunctionInvocations} from '../models/function-monitor';
import {Format} from "../pipes/table-function-monitor.pipe";
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';
import {FunctionInfo} from '../models/function-info';
import {BusyStateComponent} from './busy-state.component';
import {TooltipContentComponent} from './tooltip-content.component';
import {TooltipComponent} from './tooltip.component';
import {GlobalStateService} from '../services/global-state.service';

@Component({
    selector: 'table-function-monitor',
    templateUrl: 'templates/table-function-monitor.html',
    styleUrls: ['styles/table-function.style.css'],
    pipes: [Format, TranslatePipe],
    directives: [BusyStateComponent, TooltipContentComponent, TooltipComponent]
})

export class TableFunctionMonitor implements OnChanges {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @Input() columns: any[];
    @Input() data: any[];
    @Input() details: any;
    @Input() invocation: any;
    @Input() pulseUrl: string;
    @Input() selectedFuncId: string;

    public outputLog: string;
    public selectedRowId: string;

    constructor(
        private _functionMonitorService: FunctionMonitorService,
        private _translateService: TranslateService,
        private _globalStateService: GlobalStateService) { }

    showDetails(rowData: FunctionInvocations) {
        this._functionMonitorService.getInvocationDetailsForSelectedInvocation(rowData.id).subscribe(results => {
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
        this._functionMonitorService.getInvocationsDataForSelctedFunction(this.selectedFuncId).subscribe(result => {
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