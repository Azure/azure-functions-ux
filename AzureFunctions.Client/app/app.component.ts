import {Component, OnInit} from 'angular2/core';
import {SideBarComponent} from './sidebar.component';
import {TopBarComponent} from './top-bar.component';
import {AceEditorDirective} from './ace-editor.directive';
import {FunctionDetailsComponent} from './function-details.component';
import {FunctionsService} from './functions.service';
import {FunctionInfo} from './function-info';
import {VfsObject} from './vfs-object';

@Component({
    selector: 'azure-functions-app',
    templateUrl: 'templates/app.html',
    directives: [SideBarComponent, TopBarComponent, AceEditorDirective],
    providers: [FunctionsService]
})
export class AppComponent implements OnInit{
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public selectedFile: VfsObject;
    public content: string;

    constructor(private _functionsService: FunctionsService) {
        this.content = "hello";
    }

    ngOnInit() {
        this._functionsService.getFunctions().subscribe(res => this.functionsInfo = res);
    }

    onFunctionSelect(functionInfo: FunctionInfo){
        this.selectedFunction = functionInfo;
    }

    onFileSelect(file: VfsObject) {
        this.selectedFile = file;
        this.content += this.selectedFile.name;
    }
}