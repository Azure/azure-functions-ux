import {Component, OnInit, OnChanges, SimpleChange, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {BusyStateComponent} from './busy-state.component';
import {FunctionsService} from '../services/functions.service';
import {FileSelectDirective, FileDropDirective, FileUploader} from 'ng2-file-upload/ng2-file-upload';
import {GlobalStateService} from '../services/global-state.service';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event';
import {Subscription as RxSubscription} from 'rxjs/Rx';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';

@Component({
    selector: 'file-explorer',
    templateUrl: 'templates/file-explorer.component.html',
    styleUrls: ['styles/file-explorer.style.css'],
    directives: [BusyStateComponent, FileSelectDirective, FileDropDirective],
    pipes: [TranslatePipe]
})
export class FileExplorerComponent implements OnChanges {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @Input() selectedFile: VfsObject;
    @Input() functionInfo: FunctionInfo;
    @Output() selectedFunctionChange: EventEmitter<FunctionInfo>;
    @Output() selectedFileChange: EventEmitter<VfsObject>;

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

    constructor(
        private _functionsService: FunctionsService,
        private _globalStateService: GlobalStateService,
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService) {
        this.selectedFileChange = new EventEmitter<VfsObject>();
        this.selectedFunctionChange = new EventEmitter<FunctionInfo>();
        this.selectedFunctionChange
            .switchMap(e =>  this._functionsService.getVfsObjects(e))
            .subscribe(r => {
                    this.folders = this.getFolders(r);
                    this.files = this.getFiles(r);
            });

        this.history = [];
        this.uploader = new FileUploader({url: ''});
        this.uploader.onAfterAddingAll = (files: any[]) => {
            this.setBusyState();
            let url = this.currentVfsObject ? this.currentVfsObject.href : this.functionInfo.script_root_path_href;
            url = this.trim(url);
            this.uploader.setOptions({
                authToken: `Bearer ${this._globalStateService.CurrentToken}`,
                headers: [{name: 'If-Match', value: '*'}]
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
            this._functionsService.ClearAllFunctionCache(this.functionInfo);
            this.refresh();
        };

        this.uploader.onErrorItem = (item, response, status, headers) => {
            this._broadcastService.broadcast(BroadcastEvent.Error, {message: '', details: ''});
        };

    }

    ngOnChanges(changes: {[key: string]: SimpleChange}) {
        if (changes['functionInfo']) {
            this.currentTitle = this.functionInfo.name;
            this.selectedFunctionChange.emit(this.functionInfo);
        }
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

    addFile(content? : string) {
        let href = this.currentVfsObject
            ? `${this.trim(this.currentVfsObject.href)}/${this.newFileName}`
            : `${this.trim(this.functionInfo.script_root_path_href)}/${this.newFileName}`;
        this.setBusyState();
        var saveFileObservable = this._functionsService.saveFile(href, content || '', this.functionInfo);
        saveFileObservable
            .subscribe(r => {
                if (this.newFileName.indexOf('\\') !== -1 || this.newFileName.indexOf('/') !== -1) {
                    this._functionsService.ClearAllFunctionCache(this.functionInfo);
                    this.refresh();
                } else {
                    let o = typeof r === 'string'
                        ? {name: this.newFileName, href: href, mime: 'file'}
                        : r;
                    this.files.push(o);
                    this.selectVfsObject(o, true);
                }
                this.creatingNewFile = false;
                this.renamingFile = false;
                delete this.newFileName;
            }, e => {
                if (e) {
                    let body = e.json();
                    this._broadcastService.broadcast(BroadcastEvent.Error, {
                        message: body.ExceptionMessage || this._translateService.instant(PortalResources.fileExplorer_errorCreatingFile, { fileName: this.newFileName })
                    });
                }
                this.clearBusyState();
            });
        return saveFileObservable;
    }

    renameFile() {
        this.setBusyState();
        this._functionsService.getFileContent(this.selectedFile)
            .subscribe(content => {
                var bypassConfirm = true;
                this.addFile(content).subscribe(s => this.deleteCurrentFile(bypassConfirm));
            }, e => this.clearBusyState());
    }

    handleKeyUp(event: KeyboardEvent) {
        if (event.keyCode === 13) {
            // Enter
            if (this.creatingNewFile) {
                this.addFile();
            } else if (this.renamingFile) {
                this.renameFile();
            }

        } else if (event.keyCode === 27) {
            // ESC
            delete this.newFileName;
            this.creatingNewFile = false;
            if (this.renamingFile) {
                this.files.push(this.selectedFile);
                this.renamingFile = false;
            }
        }
    }

    trim(str: string): string {
        return str.charAt(str.length - 1) === '/'
            ? str.substring(0, str.length - 1)
            : str;
    }

    deleteCurrentFile(bypassConfirm?: boolean) {
        if (bypassConfirm !== true && !confirm(this._translateService.instant(PortalResources.fileExplorer_deletePromt, { fileName: this.selectedFile.name }) )) return;
        this.setBusyState();
        this._functionsService.deleteFile(this.selectedFile, this.functionInfo)
            .subscribe((deleted : VfsObject) => {
                this._functionsService.ClearAllFunctionCache(this.functionInfo);
                this.clearBusyState();
                var fileIndex = this.files.map(e => e.href).indexOf(deleted.href);
                if (fileIndex === -1 || this.files.length == 1) {
                    this.refresh();
                } else {
                    this.files.splice(fileIndex, 1);
                    this.selectVfsObject(this.files[0]);
                }
            }, e => {
                if (e) {
                    let body = e.json();
                    this._broadcastService.broadcast(BroadcastEvent.Error, { message: body.ExceptionMessage || this._translateService.instant(PortalResources.fileExplorer_errorDeletingFile, { fileName: this.selectedFile.name }) });
                }
                this.clearBusyState();
            });
    }

    renameCurrentFile(event: Event, element: any) {
        if (!this.switchFiles()) return;
        this.newFileName = this.selectedFile.name;
        this.renamingFile = true;
        var fileIndex = this.files.map(e => e.href).indexOf(this.selectedFile.href);
        if (fileIndex !== -1) {
            this.files.splice(fileIndex, 1);
        }
        setTimeout(() => element.focus(), 50);
    }

    getFileTitle(file: VfsObject) {
        return (file.isBinary) ? this._translateService.instant(PortalResources.fileExplorer_editingBinary) : file.name;
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
        var switchFiles = true;
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