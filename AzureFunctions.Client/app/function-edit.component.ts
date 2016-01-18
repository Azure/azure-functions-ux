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
        if (file.isNew) {
            file.href = file.href + file.name;
        }

        this._functionsService.saveFile(file, this.updatedContent)
            .subscribe(r => {
                file.isDirty = false;
                if (file.isNew) {
                    file.isNew = false;
                    this.selectedFunction.files.push(file);
                }
            });
    }

    contentChanged(content: string) {
        this.selectedFile.isDirty = true;
        this.updatedContent = content;
    }

    deleteFunction(functionInfo: FunctionInfo) {
        this._functionsService.deleteFunction(functionInfo)
            .subscribe(r => {
                this.deleteSelectedFunction.next(false);
                this.deleteSelectedFunction.next(true);
            });
    }
}