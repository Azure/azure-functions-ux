import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from './functions.service';
import {FunctionInfo} from './function-info';
import {VfsObject} from './vfs-object';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

@Component({
    selector: 'sidebar',
    templateUrl: 'templates/sidebar.html',
    inputs: ['functionsInfo'],
    outputs: ['functionSelected: selectedFunction', 'fileSelected: selectedFile']
})
export class SideBarComponent {
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public selectedFile: VfsObject;
    public functionFiles: VfsObject[];
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
            .distinctUntilChanged()
            .switchMap<VfsObject[]>(fi => {
                this.selectedFunction = fi;
                this.functionSelected.next(fi);
                this.functionFiles = [];
                if (fi.name === 'New Function' || fi.name === 'Settings') {
                    return Observable.empty<VfsObject[]>();
                } else {
                    return this._functionsService.getFunctionContent(fi)
                }
            })
            .subscribe(res => this.functionFiles = res);

        this.fileClickStream
            .distinctUntilChanged()
            .switchMap<string>(file =>  {
                this.selectedFile = file;
                return this._functionsService.getFileContent(file)
            })
            .subscribe(content => {
                this.selectedFile.content = content;
                this.fileSelected.next(this.selectedFile)
            });
    }
}