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
    @Output() selectedFileChange: EventEmitter<VfsObject>;

    constructor() {
        this.selectedFileChange = new EventEmitter<VfsObject>();
    }

    ngOnInit() {
    }

    ngOnChanges(changes: {[key: string]: SimpleChange}) {

    }

    setBusyState() {
        if (this.busyState)
            this.busyState.setBusy();
    }

    clearBusyState() {
        if (this.busyState)
            this.busyState.clearBusy();
    }

}