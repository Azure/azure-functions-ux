import {Component, OnInit, OnChanges, SimpleChange, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {BusyStateComponent} from './busy-state.component';

@Component({
    selector: 'file-explorer',
    templateUrl: 'templates/file-explorer.component.html',
    styleUrls: ['styles/file-explorer.style.css'],
    directives: [BusyStateComponent]
})
export class FileExplorerComponent implements OnInit, OnChanges {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @Input() functionFiles: VfsObject[];
    @Input() selectedFile: VfsObject;
    @Input() functionInfo: FunctionInfo;
    @Output() selectedFileChange: EventEmitter<VfsObject>;
    currentTitle: string;

    constructor() {
        this.selectedFileChange = new EventEmitter<VfsObject>();
    }

    ngOnInit() {
        this.currentTitle = this.functionInfo.name;
    }

    ngOnChanges(changes: {[key: string]: SimpleChange}) {

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