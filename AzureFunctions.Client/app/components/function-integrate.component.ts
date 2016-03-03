import {Component} from 'angular2/core';
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
export class FunctionIntegrateComponent {
    public _selectedFunction: FunctionInfo;
    public configContent: string;
    public updatedContent: string;
    public isDirty: boolean;

    constructor(private _functionsService: FunctionsService) {
        this.isDirty = false;
    }

    set selectedFunction(value: FunctionInfo) {
        this._selectedFunction = value;
        this.configContent = JSON.stringify(value.config, undefined, 2);
    }

    contentChanged(content: string) {
        this.isDirty = true;
        this.updatedContent = content;
    }

    saveConfig() {
        if (this.isDirty) {
            this._selectedFunction.config = JSON.parse(this.updatedContent);
            this._functionsService.updateFunction(this._selectedFunction)
                .subscribe(fi => this.isDirty = false);
        }
    }
}