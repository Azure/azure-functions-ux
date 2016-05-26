import {Component, OnInit, OnChanges, SimpleChange, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {BusyStateComponent} from './busy-state.component';
import {FunctionsService} from '../services/functions.service';

@Component({
    selector: 'file-explorer',
    templateUrl: 'templates/file-explorer.component.html',
    styleUrls: ['styles/file-explorer.style.css'],
    directives: [BusyStateComponent]
})
export class FileExplorerComponent implements OnInit, OnChanges {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @Input() selectedFile: VfsObject;
    @Input() functionInfo: FunctionInfo;
    @Output() selectedFileChange: EventEmitter<VfsObject>;

    folders: VfsObject[];
    files: VfsObject[];
    currentTitle: string;
    parent: VfsObject;
    history: VfsObject[];


    constructor(private _functionsService: FunctionsService) {
        this.selectedFileChange = new EventEmitter<VfsObject>();
        this.history = [];
    }

    ngOnInit() {
        this.currentTitle = this.functionInfo.name;
        this._functionsService.getVfsObjects(this.functionInfo)
            .subscribe(r => {
                this.folders = r.filter(e => e.mime === 'inode/directory').sort((a, b) => a.name.localeCompare(b.name));
                this.files = r.filter(e => e.mime !== 'inode/directory').sort((a, b) => a.name.localeCompare(b.name));
            });
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

    selectVfsObject(vfsObject: VfsObject | string, skipHistory?: boolean, name?: string) {

        if (typeof vfsObject === 'string' || (typeof vfsObject !== 'string' && vfsObject.mime === 'inode/directory')) {
            this.setBusyState();
            if (typeof vfsObject !== 'string' && !skipHistory) {
                if (this.parent) this.history.push(this.parent);
                this.parent = vfsObject;
            }

            this._functionsService.getVfsObjects(typeof vfsObject === 'string' ? vfsObject : vfsObject.href)
                .subscribe(r => {
                    this.folders = r.filter(e => e.mime === 'inode/directory').sort((a, b) => a.name.localeCompare(b.name));
                    this.files = r.filter(e => e.mime !== 'inode/directory').sort((a, b) => a.name.localeCompare(b.name));
                    this.currentTitle = name || '..';
                    this.clearBusyState();
                }, () => this.clearBusyState());
                return;
        }

        if (typeof vfsObject !== 'string') {
             this.selectedFileChange.emit(vfsObject);
        }
    }

    headingClick() {
        if (this.history.length === 0) {
            delete this.parent;
            this.selectVfsObject(this.functionInfo.script_root_path_href, true, this.functionInfo.name);
        } else {
            this.parent = this.history.pop();
            this.selectVfsObject(this.parent, true);
        }
    }
}