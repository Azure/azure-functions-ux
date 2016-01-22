import {Component, OnInit} from 'angular2/core';
import {VfsObject} from '../models/vfs-object';
import {FunctionInfo} from '../models/function-info';
import {FunctionsService} from '../services/functions.service';
import {AceEditorDirective} from '../directives/ace-editor.directive';

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
    public running: boolean;
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
        this.running = true;
        this._functionsService.saveFile(this.testDataFile, this.updatedContent || this.testDataFile.content)
            .subscribe(r => console.log(r));
        this._functionsService.runFunction(this.functionInfo, this.updatedContent || this.testDataFile.content)
            .subscribe(r => this.runResult = r,
                       e => this.runResult = e,
                       () => this.running = false);
    }

    getStatus() {
        this._functionsService.getRunStatus(this.functionInfo, this.runId)
            .subscribe(r => this.runResult = r);
    }
}