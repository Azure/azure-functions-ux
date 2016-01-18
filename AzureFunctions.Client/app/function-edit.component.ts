import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from './functions.service';
import {FunctionInfo} from './function-info';
import {VfsObject} from './vfs-object';
import {AceEditorDirective} from './ace-editor.directive';
import {FunctionRunComponent} from './function-run.component';

@Component({
    selector: 'function-edit',
    templateUrl: 'templates/function-edit.html',
    inputs: ['selectedFunction', 'selectedFile'],
    outputs: ['deleteSelectedFunction'],
    directives: [AceEditorDirective, FunctionRunComponent]
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