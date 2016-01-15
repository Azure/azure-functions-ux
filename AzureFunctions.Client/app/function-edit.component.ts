import {Component, OnInit} from 'angular2/core';
import {FunctionsService} from './functions.service';
import {FunctionInfo} from './function-info';
import {VfsObject} from './vfs-object';
import {AceEditorDirective} from './ace-editor.directive';

@Component({
    selector: 'function-edit',
    templateUrl: 'templates/function-edit.html',
    inputs: ['selectedFunction', 'selectedFile'],
    directives: [AceEditorDirective]
})
export class FunctionEditComponent {
    public selectedFunction: FunctionInfo;
    public selectedFile: VfsObject;
    private updatedContent: string;

    constructor(private _functionsService: FunctionsService) {}

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
}