import {Component, OnInit} from 'angular2/core';
import {VfsObject} from './vfs-object';
import {FunctionInfo} from './function-info';
import {FunctionsService} from './functions.service';
import {AceEditorDirective} from './ace-editor.directive';

@Component({
    selector: 'function-run',
    templateUrl: 'templates/function-run.html',
    inputs: ['testDataFile', 'functionInfo'],
    directives: [AceEditorDirective]
})
export class FunctionRunComponent {
    public showRun: boolean;
    public testDataFile: VfsObject;
    public functionInfo: FunctionInfo;
    public runId: string;
    public runResult: string;
    private updatedContent: string;

    constructor(private _functionsService: FunctionsService) { }

    toggleShowRun() {
        this.showRun = !this.showRun;
        this._functionsService.getTestData(this.functionInfo)
            .subscribe(r => this.testDataFile = r);
    }

    contentChanged(content: string) {
        this.updatedContent = content;
    }

    runFunction() {
        this._functionsService.saveFile(this.testDataFile, this.updatedContent || this.testDataFile.content)
            .subscribe(r => console.log(r));
        this._functionsService.runFunction(this.functionInfo, this.updatedContent || this.testDataFile.content)
            .subscribe(r => this.runResult = r,
                       e => this.runResult = e);
    }

    getStatus() {
        this._functionsService.getRunStatus(this.functionInfo, this.runId)
            .subscribe(r => this.runResult = r);
    }
}