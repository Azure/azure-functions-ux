import {Component, OnInit, OnChanges, SimpleChange, Input, Output, EventEmitter} from '@angular/core';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';

@Component({
    selector: 'file-explorer',
    templateUrl: 'templates/file-explorer.component.html',
    styleUrls: ['styles/file-explorer.style.css']
})
export class FileExplorerComponent implements OnInit, OnChanges {
    @Input() functionFiles: VfsObject[];
    @Input() selectedFile: VfsObject;
    @Output() selectedFileChange: EventEmitter<VfsObject>;

    constructor() {
        this.selectedFileChange = new EventEmitter<VfsObject>();
        this.selectedFileChange
    }

    ngOnInit() {

    }

    ngOnChanges(changes: {[key: string]: SimpleChange}) {

    }

}