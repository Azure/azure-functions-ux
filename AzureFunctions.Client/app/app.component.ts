import {Component, OnInit} from 'angular2/core';
import {SideBarComponent} from './sidebar.component';
import {TopBarComponent} from './top-bar.component';
import {FunctionDetailsComponent} from './function-details.component';
import {NewFunctionComponent} from './new-function.component';
import {FunctionEditComponent} from './function-edit.component';
import {FunctionsService} from './functions.service';
import {FunctionInfo} from './function-info';
import {VfsObject} from './vfs-object';
import {FunctionTemplate} from './function-template';
import {ScmInfo} from './scm-info';

@Component({
    selector: 'azure-functions-app',
    templateUrl: 'templates/app.html',
    directives: [SideBarComponent, TopBarComponent, NewFunctionComponent, FunctionEditComponent],
})
export class AppComponent implements OnInit{
    public functionsInfo: FunctionInfo[];
    public functionTemplates: FunctionTemplate[];
    public selectedFunction: FunctionInfo;
    public selectedFile: VfsObject;
    public deleteSelectedFunction: boolean;
    private initializing: boolean;

    constructor(private _functionsService: FunctionsService) { }

    ngOnInit() {
        this.initializing = true;
        this._functionsService.initializeUser()
            .subscribe(r => {
                this.initFunctions();
                this._functionsService.getTemplates()
                    .subscribe(res => this.functionTemplates = res);
            });
    }

    initFunctions() {
                this._functionsService.getFunctions()
                    .subscribe(res => {
                        res.unshift(this._functionsService.getNewFunctionNode());
                        res.unshift(this._functionsService.getSettingsNode());
                        this.functionsInfo = res;
                        this.initializing = false;
                    });
    }

    onFunctionSelect(functionInfo: FunctionInfo){
        this.selectedFunction = functionInfo;
        if (functionInfo.name === 'New Function') {
            delete this.selectedFile;
        }
    }

    onFileSelect(file: VfsObject) {
        this.selectedFile = file;
    }

    onDeleteSelectedFunction(deleteSelectedFunction: boolean) {
        this.deleteSelectedFunction = deleteSelectedFunction;
        if (deleteSelectedFunction) {
            this.selectedFile = null;
            this.selectedFunction = null;
        }
    }

}