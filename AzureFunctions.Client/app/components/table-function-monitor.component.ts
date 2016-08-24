import {Component, Input, OnChanges, SimpleChange} from '@angular/core';
import {FunctionMonitorService} from '../services/function-monitor.service';
import {FunctionInvocations} from '../models/function-monitor';
import {Format} from "../pipes/table-function-monitor.pipe";
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';

@Component({
    selector: 'table-function-monitor',
    templateUrl: 'templates/table-function-monitor.html',
    styleUrls: ['styles/table-function-monitor.style.css'],
    pipes: [Format, TranslatePipe]
})

export class TableFunctionMonitor implements OnChanges {
    @Input() columns: any[];
    @Input() data: any[];
    @Input() details: any;
    @Input() pulseUrl: string;

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
}