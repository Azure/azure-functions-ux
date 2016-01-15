import {Component, OnInit} from 'angular2/core';
import {SideBarComponent} from './sidebar.component';
import {TopBarComponent} from './top-bar.component';
import {AceEditorDirective} from './ace-editor.directive';
import {FunctionDetailsComponent} from './function-details.component';
import {NewFunctionComponent} from './new-function.component';
import {FunctionsService} from './functions.service';
import {FunctionInfo} from './function-info';
import {VfsObject} from './vfs-object';
import {FunctionTemplate} from './function-template';
import {ScmInfo} from './scm-info';

@Component({
    selector: 'azure-functions-app',
    templateUrl: 'templates/app.html',
    directives: [SideBarComponent, TopBarComponent, AceEditorDirective, NewFunctionComponent],
})
export class AppComponent implements OnInit{
    public functionsInfo: FunctionInfo[];
    public functionTemplates: FunctionTemplate[];
    public selectedFunction: FunctionInfo;
    public selectedFile: VfsObject;
    private updatedContent: string;
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

    saveFile(file: VfsObject) {
        this._functionsService.saveFile(file, this.updatedContent)
            .subscribe(r => file.dirty = false);
    }

    contentChanged(content: string) {
        this.selectedFile.dirty = true;
        this.updatedContent = content;
    }
}