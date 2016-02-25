import {Component, OnInit, EventEmitter, QueryList} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {AceEditorDirective} from '../directives/ace-editor.directive';
import {FunctionRunComponent} from './function-run.component';
import {FunctionDesignerComponent} from './function-designer.component';
import {LogStreamingComponent} from './log-streaming.component';
import {FunctionConfig} from '../models/function-config';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Rx';
import {FunctionSecrets} from '../models/function-secrets';

@Component({
    selector: 'function-dev',
    templateUrl: 'templates/function-dev.component.html',
    styleUrls: ['styles/function-dev.style.css'],
    inputs: ['selectedFunction'],
    directives: [
        AceEditorDirective,
        FunctionRunComponent,
        FunctionDesignerComponent,
        LogStreamingComponent
    ]
})
export class FunctionDevComponent {
    public functionInfo: FunctionInfo;
    public scriptFile: VfsObject;
    public content: string;
    public fileName: string;
    public inIFrame: boolean;
    private updatedContent: string;
    private functionSelectStream: Subject<FunctionInfo>;

    constructor(private _functionsService: FunctionsService) {
        this.functionSelectStream = new Subject<FunctionInfo>();
        this.functionSelectStream
            .distinctUntilChanged()
            .switchMap(fi =>
                Observable.zip(
                    this._functionsService.getFileContent(fi.script_href),
                    fi.clientOnly ? Observable.of({}) : this._functionsService.getSecrets(fi),
                    fi.clientOnly ? Observable.of(fi) : this._functionsService.getFunction(fi),
                    (c, s, f) => ({ content: c, secrets: s, functionInfo: f })
                )
            )
            .subscribe((res: any) => {
                this.functionInfo = res.functionInfo;
                var fileName = this.functionInfo.script_href.substring(this.functionInfo.script_href.lastIndexOf('/') + 1);
                this.fileName = fileName;
                this.scriptFile = { href: this.functionInfo.script_href, name: fileName };
                this.content = res.content;
            });

    }

    set selectedFunction(value: FunctionInfo) {
        this.functionSelectStream
            .next(value);
    }

    saveScript() {
        this._functionsService.saveFile(this.scriptFile, this.updatedContent)
            .subscribe(r => {
                if (typeof r !== 'string') {
                    r.isDirty = false;
                }
            });
    }

    contentChanged(content: string) {
        this.scriptFile.isDirty = true;
        this.updatedContent = content;
    }
}
