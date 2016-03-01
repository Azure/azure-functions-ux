import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {PortalService} from '../services/portal.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {AceEditorDirective} from '../directives/ace-editor.directive';
import {FunctionRunComponent} from './function-run.component';
import {FunctionDesignerComponent} from './function-designer.component';
import {LogStreamingComponent} from './log-streaming.component';
import {FunctionDevComponent} from './function-dev.component';
import {FunctionConfig} from '../models/function-config';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Rx';
import {FunctionSecrets} from '../models/function-secrets';
import {TabsComponent} from './tabs.component';
import {TabComponent} from './tab.component';
import {FunctionConfigureComponent} from './function-configure.component';

@Component({
    selector: 'function-edit',
    templateUrl: 'templates/function-edit.component.html',
    styleUrls: ['styles/function-edit.style.css'],
    inputs: ['selectedFunction'],
    outputs: ['deleteSelectedFunction'],
    directives: [
        FunctionDevComponent,
        AceEditorDirective,
        FunctionRunComponent,
        FunctionDesignerComponent,
        LogStreamingComponent,
        TabsComponent,
        TabComponent,
        FunctionConfigureComponent
    ]
})
export class FunctionEditComponent {
    public functionInfo: FunctionInfo;
    public deleteSelectedFunction: EventEmitter<boolean>;
    public inIFrame: boolean;

    constructor(private _functionsService: FunctionsService, private _portalService: PortalService) {
        this.inIFrame = this._portalService.inIFrame;
        this.deleteSelectedFunction = new EventEmitter<boolean>();
    }

    set selectedFunction(value: FunctionInfo) {
        this.functionInfo = value;
    }

    onDeleteSelectedFunction(deleteSelectedFunction: boolean) {
        this.deleteSelectedFunction.emit(deleteSelectedFunction);
    }
}