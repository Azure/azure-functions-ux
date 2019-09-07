import { FileUtilities } from './../shared/Utilities/file';
import { Component, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
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
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { HttpResult } from 'app/shared/models/http-result';
import { FunctionService } from 'app/shared/services/function.service';

@Component({
  selector: 'file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss', '../function-dev/function-dev.component.scss'],
})
export class FileExplorerComponent extends FunctionAppContextComponent {
  @ViewChild(BusyStateComponent)
  busyState: BusyStateComponent;
  @Input()
  selectedFile: VfsObject;
  @Input()
  functionInfo: FunctionInfo;
  @Input()
  masterKey: string;
  @Output()
  selectedFileChange: Subject<VfsObject>;
  @Output()
  closeClicked = new Subject<any>();
  @ViewChild('container')
  container: ElementRef;

  folders: VfsObject[];
  files: VfsObject[];
  currentTitle: string;
  currentVfsObject: VfsObject;
  history: VfsObject[];
  creatingNewFile: boolean;
  newFileName: string;

  public uploader: FileUploader;

  constructor(
    broadcastService: BroadcastService,
    private _globalStateService: GlobalStateService,
    private _translateService: TranslateService,
    private _functionAppService: FunctionAppService,
    private _aiService: AiService,
    functionService: FunctionService
  ) {
    super('file-explorer', _functionAppService, broadcastService, functionService, () => this.setBusyState());

    this.selectedFileChange = new Subject<VfsObject>();

    this.history = [];
    // Kudu doesn't handle multipleparts upload correctly.
    this.uploader = new FileUploader({ url: '', disableMultipart: true });
    this.uploader.onAfterAddingAll = (files: any[]) => {
      this.setBusyState();
      let url = this.currentVfsObject ? this.currentVfsObject.href : this.functionInfo.script_root_path_href;
      url = this.trim(url);
      this._setHeaders();
      for (let i = 0; i < files.length; i++) {
        files[i].method = 'PUT';
        files[i].url = `${url}/${files[i].file.name}`;
        files[i].withCredentials = false;
      }
      this.uploader.uploadAll();
    };

    this.uploader.onCompleteAll = () => {
      this.uploader.clearQueue();
      this.refresh();
      this._aiService.trackEvent('/actions/file_explorer/upload_file');
    };

    this.uploader.onErrorItem = (/*item, response, status, headers */) => {
      this._broadcastService.broadcast(BroadcastEvent.Error, { message: '', details: '' });
    };
  }

  setup(): Subscription {
    return this.viewInfoEvents
      .switchMap(e => {
        this.resetState();
        if (e.functionInfo.isSuccessful) {
          this.functionInfo = e.functionInfo.result.properties;
          this.currentTitle = this.functionInfo.name;
          return this._functionAppService.getVfsObjects(this.context, e.functionInfo.result.properties);
        } else {
          return Observable.of({
            isSuccessful: false,
            result: null,
            error: {
              errorId: '',
            },
          });
        }
      })
      .do(() => this.clearBusyState())
      .subscribe(r => {
        if (r.isSuccessful) {
          this.folders = this.getFolders(r.result);
          this.files = this.getFiles(r.result);
          this._setHeaders();
        }
      });
  }

  resetState() {
    this.creatingNewFile = false;
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

      this._functionAppService.getVfsObjects(this.context, typeof vfsObject === 'string' ? vfsObject : vfsObject.href).subscribe(
        r => {
          this.folders = this.getFolders(r.result);
          this.files = this.getFiles(r.result);
          this.currentTitle = name || '..';
          this.clearBusyState();
        },
        () => this.clearBusyState()
      );
      return;
    }

    if (typeof vfsObject !== 'string') {
      this.selectedFileChange.next(vfsObject);
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

  addFile(content?: string): Observable<HttpResult<VfsObject | string>> {
    if (this.newFileName && this.files.find(f => f.name.toLocaleLowerCase() === this.newFileName.toLocaleLowerCase())) {
      const error = {
        message: this._translateService.instant(PortalResources.fileExplorer_fileAlreadyExists, { fileName: this.newFileName }),
      };
      this._broadcastService.broadcast(BroadcastEvent.Error, error);
      return Observable.throw(error.message);
    }

    const href = this.currentVfsObject
      ? `${this.trim(this.currentVfsObject.href)}/${this.newFileName}`
      : `${this.trim(this.functionInfo.script_root_path_href)}/${this.newFileName}`;
    this.setBusyState();
    const saveFileObservable = this._functionAppService.saveFile(this.context, href, content || '');
    saveFileObservable.subscribe(
      r => {
        if (this.newFileName.indexOf('\\') !== -1 || this.newFileName.indexOf('/') !== -1) {
          this.refresh();
          this._aiService.trackEvent('/actions/file_explorer/create_directory');
        } else {
          const o =
            typeof r.result === 'string' ? { name: this.newFileName, href: href, mime: 'file', mtime: Date.now.toString() } : r.result;
          if (typeof o !== 'string') {
            this.files.push(o);
            this.selectVfsObject(o, true);
            this._aiService.trackEvent('/actions/file_explorer/create_file');
          } else {
            this.clearBusyState();
          }
        }
        this.creatingNewFile = false;
        delete this.newFileName;
      },
      e => {
        if (e) {
          const body = e.json();
          this._broadcastService.broadcast(BroadcastEvent.Error, {
            message:
              body.ExceptionMessage ||
              this._translateService.instant(PortalResources.fileExplorer_errorCreatingFile, { fileName: this.newFileName }),
          });
          const error = new Error(body.ExceptionMessage);
          this._aiService.trackException(error);
        }
        this.clearBusyState();
      }
    );
    return saveFileObservable;
  }

  handleKeyUp(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      // Enter
      if (this.creatingNewFile && this.newFileName) {
        this.addFile();
      }
    } else if (event.keyCode === 27) {
      this.escape();
    }
  }

  trim(str: string): string {
    return str.charAt(str.length - 1) === '/' ? str.substring(0, str.length - 1) : str;
  }

  deleteCurrentFile(bypassConfirm?: boolean) {
    if (this.selectedFile.href.toLocaleLowerCase() === this.functionInfo.config_href.toLocaleLowerCase()) {
      return;
    }

    if (
      bypassConfirm !== true &&
      !confirm(this._translateService.instant(PortalResources.fileExplorer_deletePromt, { fileName: this.selectedFile.name }))
    ) {
      return;
    }

    this.setBusyState();
    this._functionAppService.deleteFile(this.context, this.selectedFile).subscribe(
      deleted => {
        this.clearBusyState();
        const result = deleted.isSuccessful ? deleted.result : '';
        const href = typeof result === 'string' ? result : result.href;
        const fileIndex = this.files.map(e => e.href).indexOf(href);
        if (fileIndex === -1 || this.files.length === 1) {
          this.refresh();
        } else {
          this.files.splice(fileIndex, 1);
          this.selectVfsObject(this.files[0]);
        }
      },
      e => {
        if (e) {
          const body = e.json();
          this._broadcastService.broadcast(BroadcastEvent.Error, {
            message:
              body.ExceptionMessage ||
              this._translateService.instant(PortalResources.fileExplorer_errorDeletingFile, { fileName: this.selectedFile.name }),
          });
        }
        this.clearBusyState();
      }
    );
    this._aiService.trackEvent('/actions/file_explorer/delete_file');
  }

  getFileTitle(file: VfsObject) {
    return file.isBinary ? this._translateService.instant(PortalResources.fileExplorer_editingBinary) : file.name;
  }

  close() {
    this.closeClicked.next(null);
  }

  onBlur() {
    this.escape();
  }

  private escape() {
    // ESC
    delete this.newFileName;
    this.creatingNewFile = false;
  }

  private getFiles(arr: VfsObject[]) {
    return arr
      .filter(e => e.mime !== 'inode/directory')
      .map(e => {
        e.isBinary = FileUtilities.isBinary(e.name);
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

  private _setHeaders() {
    if (this.context.urlTemplates.useNewUrls) {
      this.uploader.setOptions({
        headers: [{ name: 'If-Match', value: '*' }, { name: 'x-functions-key', value: this.masterKey }],
      });
    } else {
      this.uploader.setOptions({
        authToken: `Bearer ${this._globalStateService.CurrentToken}`,
        headers: [{ name: 'If-Match', value: '*' }],
      });
    }
  }
}
