import {Component, OnInit} from 'angular2/core';
import {VfsObject} from '../models/vfs-object';
import {FunctionInfo} from '../models/function-info';
import {FunctionsService} from '../services/functions.service';
import {AceEditorDirective} from '../directives/ace-editor.directive';

@Component({
    selector: 'function-run',
    templateUrl: 'templates/function-run.html',
    inputs: ['functionInfo'],
    directives: [AceEditorDirective]
})
export class FunctionRunComponent {
    public showRun: boolean;
    public testDataFile: VfsObject;
    public functionInfo: FunctionInfo;
    public runId: string;
    public runResult: string;
    public running: boolean;
    public content: string;
    private updatedContent: string;

    constructor(private _functionsService: FunctionsService) { }

    toggleShowRun() {
        this.showRun = !this.showRun;
        this.updatedContent = null;
        this._functionsService.getTestData(this.functionInfo)
            .subscribe(r => {
                this.content = r;
                this.testDataFile = {
                    href: this.functionInfo.test_data_href,
                    isDirty: false,
                    name: 'sample.dat'
                };
            });
    }

    contentChanged(content: string) {
        this.updatedContent = content;
        this.testDataFile.isDirty = true;
    }

    saveTestData() {
        this._functionsService.saveFile(this.testDataFile, this.updatedContent)
            .subscribe(r => this.testDataFile.isDirty = false);
    }

    runFunction() {
        this.running = true;
        this.saveTestData();
        this._functionsService.runFunction(this.functionInfo, this.updatedContent || this.content)
            .subscribe(r => this.runResult = r,
                       e => this.runResult = e,
                       () => this.running = false);
    }

    getStatus() {
        this._functionsService.getRunStatus(this.functionInfo, this.runId)
            .subscribe(r => this.runResult = r);
    }
}