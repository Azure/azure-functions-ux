import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from '.././services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {FunctionConfig} from '../models/function-config';
import {VfsObject} from '../models/vfs-object';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

@Component({
    selector: 'sidebar',
    templateUrl: 'templates/sidebar.html',
    inputs: ['functionsInfo', 'deleteSelectedFunction'],
    outputs: ['functionSelected: selectedFunction', 'fileSelected: selectedFile']
})
export class SideBarComponent {
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public selectedFile: VfsObject;
    private functionSelected: EventEmitter<FunctionInfo>;
    private fileSelected: EventEmitter<VfsObject>;
    private clickStream: Subject<FunctionInfo>;
    private fileClickStream: Subject<VfsObject>;

    constructor(private _functionsService: FunctionsService) {
        this.functionSelected = new EventEmitter<FunctionInfo>();
        this.fileSelected = new EventEmitter<VfsObject>();
        this.clickStream = new Subject();
        this.fileClickStream = new Subject();

        this.clickStream
            //.distinctUntilChanged() doesn't work because fileClickStream can change the selected Function
            .switchMap(fi => {
                this.selectedFunction = fi;
                this.functionSelected.next(fi);
                this.fileSelected.next(null);
                if (fi.name === 'New Function') {
                    return Observable.empty<any>();
                } else {
                    return this._functionsService.getFunctionContent(fi);
                }
            })
            .subscribe((res: any) => {
                res.functionInfo.files = res.files;
                var functionJson: VfsObject = res.files.find(e => e.name === 'function.json')
                if (functionJson) {
                    this.createSecretIfNeeded(res.functionInfo, functionJson);
                    this.fileClickStream.next(functionJson);
                }
            });

        this.fileClickStream
            //.distinctUntilChanged() doesn't work because you may click again on the same file without clicking on any other files.
            .switchMap<string>(file =>  {
                this.selectedFile = file;
                return this._functionsService.getFileContent(file);
            })
            .subscribe(content => {
                this.selectedFile.content = content;
                this.fileSelected.next(this.selectedFile);
            });
    }

    createSecretIfNeeded(fi: FunctionInfo, functionJson: VfsObject) {
        if (!fi.secrets || !fi.secrets.webHookReceiverKey) {
            this._functionsService.getFileContent(functionJson)
                .subscribe(c => {
                    var config: FunctionConfig = JSON.parse(c);
                    if (config.bindings.input.some(e => !!e.webHookReceiver)) {
                        this._functionsService.getSecrets(fi)
                        .subscribe(r => {
                            fi.secrets = r;
                            if (!fi.secrets.webHookReceiverKey) {
                                //http://stackoverflow.com/a/8084248/3234163
                                var secret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
                                this._functionsService.setSecrets(fi, { webHookReceiverKey: secret })
                                .subscribe(r => fi.secrets = r);
                            }
                        });
                    }
                });
        }
    }

    toggle(fi: FunctionInfo) {
        if (!this.selectedFunction ||
            (fi !== this.selectedFunction && !fi.expanded) ||
            (fi === this.selectedFunction)) {
            fi.expanded = !fi.expanded;
        }
    }

    // TODO: merge these 2 functions
    onFileClick(file: VfsObject, functionInfo: FunctionInfo, event: Event) {
        this.fileClickStream.next(file);
        this.selectedFunction = functionInfo;
        this.functionSelected.next(functionInfo);
        event.stopPropagation();
        event.preventDefault();
    }

    onNewFileClick(functionInfo: FunctionInfo, event: Event) {
        this.selectedFile = this._functionsService.getNewFileObject(functionInfo);
        this.fileSelected.next(this.selectedFile);
        this.selectedFunction = functionInfo;
        this.functionSelected.next(functionInfo);
        event.stopPropagation();
        event.preventDefault();
    }

    set deleteSelectedFunction(f: boolean) {
        if (f)
        for (var i = 0; this.functionsInfo.length; i++) {
            if (this.functionsInfo[i] === this.selectedFunction) {
                this.functionsInfo.splice(i, 1);
                delete this.selectedFunction;
                delete this.selectedFile;
                break;
            }
        }
    }
}