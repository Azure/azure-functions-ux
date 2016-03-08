import {Component, OnInit} from 'angular2/core';
import {VfsObject} from '../models/vfs-object';
import {FunctionInfo} from '../models/function-info';
import {FunctionsService} from '../services/functions.service';
import {AceEditorDirective} from '../directives/ace-editor.directive';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';

@Component({
    selector: 'function-run',
    templateUrl: 'templates/function-run.component.html',
    styleUrls: ['styles/function-run.style.css'],
    inputs: ['functionInfo'],
    directives: [AceEditorDirective]
})
export class FunctionRunComponent {
    public testDataFile: VfsObject;
    public runId: string;
    public runResult: string;
    public content: string;
    private updatedContent: string;
    private _functionInfo: FunctionInfo;

    constructor(private _functionsService: FunctionsService, private _broadcastSetrvice: IBroadcastService) { }

    set functionInfo(fi: FunctionInfo) {
        this._functionInfo = fi;
        this.updatedContent = null;
        delete this.runResult;
        this._functionsService.getTestData(fi)
            .subscribe(r => {
                this.content = r;
                this.testDataFile = {
                    href: fi.test_data_href,
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
        this._broadcastSetrvice.setBusyState();
        this.saveTestData();
        this._functionsService.runFunction(this._functionInfo, this.updatedContent || this.content)
            .subscribe(r => this.runResult = r,
                       e => this.runResult = e,
                       () => this._broadcastSetrvice.clearBusyState());
    }

    getStatus() {
        this._functionsService.getRunStatus(this._functionInfo, this.runId)
            .subscribe(r => this.runResult = r);
    }
}