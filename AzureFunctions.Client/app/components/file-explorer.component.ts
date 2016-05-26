import {Component, OnInit, OnChanges, SimpleChange, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
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
    currentVfsObject: VfsObject;
    history: VfsObject[];
    creatingNewFile: boolean;
    newFileName: string;


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
                if (this.currentVfsObject) this.history.push(this.currentVfsObject);
                this.currentVfsObject = vfsObject;
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
            delete this.currentVfsObject;
            this.selectVfsObject(this.functionInfo.script_root_path_href, true, this.functionInfo.name);
        } else {
            this.currentVfsObject = this.history.pop();
            this.selectVfsObject(this.currentVfsObject, true);
        }
    }

    addnewInput(event: Event, element: any) {
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
                this.selectVfsObject(o);
                this.creatingNewFile = false;
                delete this.newFileName;
            }, () => this.clearBusyState());
    }

    handleKeyPress(event: KeyboardEvent) {
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
}