import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {AceEditorDirective} from '../directives/ace-editor.directive';
import {FunctionRunComponent} from './function-run.component';
import {FunctionDesignerComponent} from './function-designer.component';
import {FunctionConfig} from '../models/function-config';

@Component({
    selector: 'function-edit',
    templateUrl: 'templates/function-edit.html',
    inputs: ['selectedFunction', 'selectedFile'],
    outputs: ['deleteSelectedFunction'],
    directives: [AceEditorDirective, FunctionRunComponent, FunctionDesignerComponent]
})
export class FunctionEditComponent {
    public selectedFunction: FunctionInfo;
    public selectedFile: VfsObject;
    public deleteSelectedFunction: EventEmitter<boolean>;
    private updatedContent: string;


    constructor(private _functionsService: FunctionsService) {
        this.deleteSelectedFunction = new EventEmitter<boolean>();
    }

    saveFile(file: VfsObject) {
        this._functionsService.saveFile(file, this.updatedContent)
            .subscribe(r => {
                r.isDirty = false;
                if (r.isNew) {
                    r.isNew = false;
                    this.selectedFunction.files.push(r);
                }
            });
    }

    contentChanged(content: string) {
        this.selectedFile.isDirty = true;
        this.updatedContent = content;
    }

    deleteFunction(functionInfo: FunctionInfo) {
        var result = confirm(`Are you sure you want to delete Function: ${functionInfo.name}?`);
        if (result)
            this._functionsService.deleteFunction(functionInfo)
                .subscribe(r => {
                    this.deleteSelectedFunction.next(false);
                    this.deleteSelectedFunction.next(true);
                });
    }
}