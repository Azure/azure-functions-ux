import {Component, OnInit, OnChanges, SimpleChange, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {BusyStateComponent} from './busy-state.component';
import {FunctionsService} from '../services/functions.service';
import {FileSelectDirective, FileDropDirective, FileUploader} from 'ng2-file-upload/ng2-file-upload';
import {GlobalStateService} from '../services/global-state.service';
import {BroadcastService} from '../services/broadcast.service';

@Component({
    selector: 'file-explorer',
    templateUrl: 'templates/file-explorer.component.html',
    styleUrls: ['styles/file-explorer.style.css'],
    directives: [BusyStateComponent, FileSelectDirective, FileDropDirective]
})
export class FileExplorerComponent implements OnChanges {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @Input() selectedFile: VfsObject;
    @Input() functionInfo: FunctionInfo;
    @Output() selectedFileChange: EventEmitter<VfsObject>;

    folders: VfsObject[];
    files: VfsObject[];
    currentTitle: string;
    currentVfsObject: VfsObject;
    history: VfsObject[];
    creatingNewFile: boolean;
    newFileName: string;

    private binaryExtensions = ['.zip', '.exe', '.dll', '.png', '.jpeg', '.jpg', '.gif', '.bmp', '.ico', '.pdf', '.so', '.ttf', '.bz2', '.gz', '.jar', '.cab', '.tar', '.iso', '.img', '.dmg'];

    public uploader: FileUploader;

    constructor(
        private _functionsService: FunctionsService,
        private _globalStateService: GlobalStateService,
        private _broadcastService: BroadcastService) {
        this.selectedFileChange = new EventEmitter<VfsObject>();
        this.history = [];
        this.uploader = new FileUploader({url: ''});
        this.uploader.onAfterAddingAll = (files: any[]) => {
            this.setBusyState();
            let url = this.currentVfsObject ? this.currentVfsObject.href : this.functionInfo.script_root_path_href;
            url = this.trim(url);
            this.uploader.setOptions({authToken: `Bearer ${this._globalStateService.CurrentToken}`});
            for (let i = 0; i < files.length; i++) {
                files[i].method = 'PUT';
                files[i].url = `${url}/${files[i].file.name}`;
            }
            this.uploader.uploadAll();
        };

        this.uploader.onCompleteAll = () => {
            this.uploader.clearQueue();
            this.refresh();
        };

    }

    ngOnChanges(changes: {[key: string]: SimpleChange}) {
        this.currentTitle = this.functionInfo.name;
        this._functionsService.getVfsObjects(this.functionInfo)
            .subscribe(r => {
                this.folders = this.getFolders(r);
                this.files = this.getFiles(r);
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

    refresh() {
        if (this.currentVfsObject) {
            this.selectVfsObject(this.currentVfsObject, true);
        } else {
            this.selectVfsObject(this.functionInfo.script_root_path_href, true, this.functionInfo.name);
        }
    }

    selectVfsObject(vfsObject: VfsObject | string, skipHistory?: boolean, name?: string) {
        if (!this.switchFiles() || (typeof vfsObject !== 'string' && vfsObject.isBinary)) return;
        if (typeof vfsObject === 'string' || (typeof vfsObject !== 'string' && vfsObject.mime === 'inode/directory')) {
            this.setBusyState();
            if (typeof vfsObject !== 'string' && !skipHistory) {
                if (this.currentVfsObject) this.history.push(this.currentVfsObject);
                this.currentVfsObject = vfsObject;
            }

            this._functionsService.getVfsObjects(typeof vfsObject === 'string' ? vfsObject : vfsObject.href)
                .subscribe(r => {
                    this.folders = this.getFolders(r);
                    this.files = this.getFiles(r)
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
            delete this.currentVfsObject;
            this.selectVfsObject(this.functionInfo.script_root_path_href, true, this.functionInfo.name);
        } else {
            this.currentVfsObject = this.history.pop();
            this.selectVfsObject(this.currentVfsObject, true);
        }
    }

    addnewInput(event: Event, element: any) {
        if (!this.switchFiles()) return;
        this.creatingNewFile = true;
        setTimeout(() => element.focus(), 50);
    }

    addFile() {
        let href = this.currentVfsObject
            ? `${this.trim(this.currentVfsObject.href)}/${this.newFileName}`
            : `${this.trim(this.functionInfo.script_root_path_href)}/${this.newFileName}`;
        this.setBusyState();
        this._functionsService.saveFile(href, '')
            .subscribe(r => {
                let o = typeof r === 'string'
                    ? {name: this.newFileName, href: href, mime: 'file'}
                    : r;
                this.files.push(o);
                this.selectVfsObject(o, true);
                this.creatingNewFile = false;
                delete this.newFileName;
            }, () => this.clearBusyState());
    }

    handleKeyUp(event: KeyboardEvent) {
        if (event.keyCode === 13) {
            // Enter
            this.addFile();
        } else if (event.keyCode === 27) {
            // ESC
            delete this.newFileName;
            this.creatingNewFile = false;
        }
    }

    trim(str: string): string {
        return str.charAt(str.length - 1) === '/'
            ? str.substring(0, str.length - 1)
            : str;
    }

    private getFiles(arr: VfsObject[]) {
        return arr
            .filter(e => e.mime !== 'inode/directory')
            .map(e => {
                e.isBinary = this.binaryExtensions.some(t => e.name.endsWith(t));
                return e;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    private getFolders(arr: VfsObject[]) {
        return arr.filter(e => e.mime === 'inode/directory').sort((a, b) => a.name.localeCompare(b.name));
    }

    private switchFiles() {
        var switchFiles = true;
        if (this._broadcastService.getDirtyState('function')) {
            switchFiles = confirm(`Changes made to current file will be lost. Are you sure you want to continue?`);
            if (switchFiles) {
                this._broadcastService.clearDirtyState('function');
                this.selectedFile.isDirty = false;
            }
        }
        return switchFiles;
    }
}