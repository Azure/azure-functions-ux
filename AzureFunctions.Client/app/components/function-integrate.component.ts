import {Component, OnInit} from 'angular2/core';
import {AceEditorDirective} from '../directives/ace-editor.directive';
import {FunctionInfo} from '../models/function-info';
import {FunctionsService} from '../services/functions.service';

@Component({
    selector: 'function-integrate',
    templateUrl: 'templates/function-integrate.component.html',
    styleUrls: ['styles/function-integrate.style.css'],
    inputs: ['selectedFunction'],
    directives: [AceEditorDirective]
})
export class FunctionIntegrateComponent implements OnInit {
    public selectedFunction: FunctionInfo;
    public configContent: string;
    public updatedContent: string;
    public isDirty: boolean;

    constructor(private _functionsService: FunctionsService) {
        this.isDirty = false;
    }

    ngOnInit() {
        this.configContent = JSON.stringify(this.selectedFunction.config, undefined, 2);
    }

    contentChanged(content: string) {
        this.isDirty = true;
        this.updatedContent = content;
    }

    saveConfig() {
        if (this.isDirty) {
            this.selectedFunction.config = JSON.parse(this.updatedContent);
            this._functionsService.updateFunction(this.selectedFunction)
                .subscribe(fi => this.isDirty = false);
        }
    }
}