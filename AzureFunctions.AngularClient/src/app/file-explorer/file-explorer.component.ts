import { Component, OnChanges, SimpleChange, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/throw';
import { FileUploader } from 'ng2-file-upload';
import { TranslateService } from '@ngx-translate/core';

import { FunctionInfo } from '../shared/models/function-info';
import { VfsObject } from '../shared/models/vfs-object';
import { BusyStateComponent } from '../busy-state/busy-state.component';
import { GlobalStateService } from '../shared/services/global-state.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { PortalResources } from '../shared/models/portal-resources';
import { AiService } from '../shared/services/ai.service';
import { FunctionApp } from '../shared/function-app';


@Component({
    selector: 'file-explorer',
    templateUrl: './file-explorer.component.html',
    styleUrls: ['./file-explorer.component.scss', '../function-dev/function-dev.component.scss']
})
export class FileExplorerComponent implements OnChanges {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @Input() selectedFile: VfsObject;
    @Input() functionInfo: FunctionInfo;
    @Output() selectedFunctionChange: EventEmitter<FunctionInfo>;
    @Output() selectedFileChange: EventEmitter<VfsObject>;
    @Output() closeClicked = new EventEmitter<any>();
    @ViewChild('container') container: ElementRef;

    folders: VfsObject[];
    files: VfsObject[];
    currentTitle: string;
    currentVfsObject: VfsObject;
    history: VfsObject[];
    creatingNewFile: boolean;
    renamingFile: boolean;
    newFileName: string;

    private binaryExtensions = ['.zip', '.exe', '.dll', '.png', '.jpeg', '.jpg', '.gif', '.bmp', '.ico', '.pdf', '.so', '.ttf', '.bz2', '.gz', '.jar', '.cab', '.tar', '.iso', '.img', '.dmg'];

    public uploader: FileUploader;
    public functionApp: FunctionApp;

    constructor(
        private _globalStateService: GlobalStateService,
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService,
        private _aiService: AiService) {
        this.selectedFileChange = new EventEmitter<VfsObject>();
        this.selectedFunctionChange = new EventEmitter<FunctionInfo>();
        this.selectedFunctionChange
            .switchMap(e => {
                this.functionApp = e.functionApp;
                return this.functionApp.getVfsObjects(e)
            })
            .subscribe(r => {
                this.folders = this.getFolders(r);
                this.files = this.getFiles(r);
            });

        this.history = [];
        // Kudu doesn't handle multipleparts upload correctly.
        this.uploader = new FileUploader({ url: '', disableMultipart: true });
        this.uploader.onAfterAddingAll = (files: any[]) => {
            this.setBusyState();
            let url = this.currentVfsObject ? this.currentVfsObject.href : this.functionInfo.script_root_path_href;
            url = this.trim(url);
            this.uploader.setOptions({
                authToken: `Bearer ${this._globalStateService.CurrentToken}`,
                headers: [{ name: 'If-Match', value: '*' }]
            });
            for (let i = 0; i < files.length; i++) {
                files[i].method = 'PUT';
                files[i].url = `${url}/${files[i].file.name}`;
                files[i].withCredentials = false;
            }
            this.uploader.uploadAll();
        };

        this.uploader.onCompleteAll = () => {
            this.uploader.clearQueue();
            this.functionApp.ClearAllFunctionCache(this.functionInfo);
            this.refresh();
            this._aiService.trackEvent('/actions/file_explorer/upload_file');
        };

        this.uploader.onErrorItem = (/*item, response, status, headers */) => {
            this._broadcastService.broadcast(BroadcastEvent.Error, { message: '', details: '' });
        };

    }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (changes['functionInfo']) {
            this.currentTitle = this.functionInfo.name;
            this.resetState();
            this.selectedFunctionChange.emit(this.functionInfo);
        }
    }

    resetState() {
        this.creatingNewFile = false;
        this.renamingFile = false;
        delete this.newFileName;
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

    refresh() {
        if (this.currentVfsObject) {
            this.selectVfsObject(this.currentVfsObject, true);
        } else {
            this.selectVfsObject(this.functionInfo.script_root_path_href, true, this.functionInfo.name);
        }
    }

    selectVfsObject(vfsObject: VfsObject | string, skipHistory?: boolean, name?: string) {
        this._aiService.trackEvent('/actions/file_explorer/select_item');
        if (!this.switchFiles() || (typeof vfsObject !== 'string' && vfsObject.isBinary)) {
            return;
        }
        if (typeof vfsObject === 'string' || (typeof vfsObject !== 'string' && vfsObject.mime === 'inode/directory')) {
            this.setBusyState();
            if (typeof vfsObject !== 'string' && !skipHistory) {
                if (this.currentVfsObject) {
                    this.history.push(this.currentVfsObject);
                }
                this.currentVfsObject = vfsObject;
            }

            this.functionInfo.functionApp.getVfsObjects(typeof vfsObject === 'string' ? vfsObject : vfsObject.href)
                .subscribe(r => {
                    this.folders = this.getFolders(r);
                    this.files = this.getFiles(r);
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

    addnewInput(_: Event, element: any) {
        if (!this.switchFiles()) {
            return;
        }
        this.creatingNewFile = true;
        setTimeout(() => element.focus(), 50);
    }

    addFile(content?: string): Observable<VfsObject | string> {
        if (this.newFileName && this.files.find(f => f.name.toLocaleLowerCase() === this.newFileName.toLocaleLowerCase())) {
            const error = {
                message: this._translateService.instant(PortalResources.fileExplorer_fileAlreadyExists, { fileName: this.newFileName })
            };
            this._broadcastService.broadcast(BroadcastEvent.Error, error);
            return Observable.throw(error.message);
        }

        const href = this.currentVfsObject
            ? `${this.trim(this.currentVfsObject.href)}/${this.newFileName}`
            : `${this.trim(this.functionInfo.script_root_path_href)}/${this.newFileName}`;
        this.setBusyState();
        const saveFileObservable = this.functionApp.saveFile(href, content || '', this.functionInfo);
        saveFileObservable
            .subscribe(r => {
                if (this.newFileName.indexOf('\\') !== -1 || this.newFileName.indexOf('/') !== -1) {
                    this.functionApp.ClearAllFunctionCache(this.functionInfo);
                    this.refresh();
                    this._aiService.trackEvent('/actions/file_explorer/create_directory');
                } else {
                    const o = typeof r === 'string'
                        ? { name: this.newFileName, href: href, mime: 'file' }
                        : r;
                    this.files.push(o);
                    this.selectVfsObject(o, true);
                    this._aiService.trackEvent('/actions/file_explorer/create_file');
                }
                this.creatingNewFile = false;
                this.renamingFile = false;
                delete this.newFileName;
            }, e => {
                if (e) {
                    const body = e.json();
                    this._broadcastService.broadcast(BroadcastEvent.Error, {
                        message: body.ExceptionMessage || this._translateService.instant(PortalResources.fileExplorer_errorCreatingFile, { fileName: this.newFileName })
                    });
                    const error = new Error(body.ExceptionMessage);
                    this._aiService.trackException(error);
                }
                this.clearBusyState();
            });
        return saveFileObservable;
    }

    renameFile() {
        this.setBusyState();
        this.functionApp.getFileContent(this.selectedFile)
            .subscribe(content => {
                const bypassConfirm = true;
                this.addFile(content)
                    .subscribe(() => this.deleteCurrentFile(bypassConfirm), () => this.clearBusyState());
            }, () => this.clearBusyState());
        this._aiService.trackEvent('/actions/file_explorer/rename_file');
    }

    handleKeyUp(event: KeyboardEvent) {
        if (event.keyCode === 13) {
            // Enter
            if (this.creatingNewFile && this.newFileName) {
                this.addFile();
            } else if (this.renamingFile) {
                // TODO: handle filename in an input validator.
                if (this.newFileName && this.newFileName.toLocaleLowerCase() !== this.selectedFile.name.toLocaleLowerCase()) {
                    this.renameFile();
                } else {
                    this.files.push(this.selectedFile);
                    this.renamingFile = false;
                }
            }

        } else if (event.keyCode === 27) {
            this.escape();
        }
    }

    trim(str: string): string {
        return str.charAt(str.length - 1) === '/'
            ? str.substring(0, str.length - 1)
            : str;
    }

    deleteCurrentFile(bypassConfirm?: boolean) {
        if (this.selectedFile.href.toLocaleLowerCase() === this.functionInfo.config_href.toLocaleLowerCase()) {
            return;
        }

        if (bypassConfirm !== true && !confirm(this._translateService.instant(PortalResources.fileExplorer_deletePromt, { fileName: this.selectedFile.name }))) {
            return;
        }

        this.setBusyState();
        this.functionApp.deleteFile(this.selectedFile, this.functionInfo)
            .subscribe((deleted: VfsObject) => {
                this.functionApp.ClearAllFunctionCache(this.functionInfo);
                this.clearBusyState();
                const fileIndex = this.files.map(e => e.href).indexOf(deleted.href);
                if (fileIndex === -1 || this.files.length === 1) {
                    this.refresh();
                } else {
                    this.files.splice(fileIndex, 1);
                    this.selectVfsObject(this.files[0]);
                }
            }, e => {
                if (e) {
                    const body = e.json();
                    this._broadcastService.broadcast(BroadcastEvent.Error, { message: body.ExceptionMessage || this._translateService.instant(PortalResources.fileExplorer_errorDeletingFile, { fileName: this.selectedFile.name }) });
                }
                this.clearBusyState();
            });
        this._aiService.trackEvent('/actions/file_explorer/delete_file');
    }

    renameCurrentFile(_: Event, element: any) {
        if (this.selectedFile.href.toLocaleLowerCase() === this.functionInfo.config_href.toLocaleLowerCase() || !this.switchFiles()) {
            return;
        }
        this.newFileName = this.selectedFile.name;
        this.renamingFile = true;
        const fileIndex = this.files.map(e => e.href).indexOf(this.selectedFile.href);
        if (fileIndex !== -1) {
            this.files.splice(fileIndex, 1);
        }
        setTimeout(() => element.focus(), 50);
    }

    getFileTitle(file: VfsObject) {
        return (file.isBinary) ? this._translateService.instant(PortalResources.fileExplorer_editingBinary) : file.name;
    }

    close() {
        this.closeClicked.emit(null);
    }

    onBlur() {
        this.escape();
    }

    private escape() {
        // ESC
        delete this.newFileName;
        this.creatingNewFile = false;
        if (this.renamingFile) {
            this.files.push(this.selectedFile);
            this.renamingFile = false;
        }
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

    private switchFiles(): boolean {
        let switchFiles = true;
        if (this._broadcastService.getDirtyState('function')) {
            switchFiles = confirm(this._translateService.instant(PortalResources.fileExplorer_changesLost));
            if (switchFiles) {
                this._broadcastService.clearDirtyState('function');
                this.selectedFile.isDirty = false;
            }
        }
        return switchFiles;
    }
}
