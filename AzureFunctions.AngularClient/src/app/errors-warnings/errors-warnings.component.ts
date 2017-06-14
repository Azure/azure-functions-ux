import {Component, OnDestroy, OnInit, OnChanges, Input, Inject, Output, EventEmitter, SimpleChanges, ViewChild, ElementRef} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import {TranslatePipe} from '@ngx-translate/core';
import {Diagnostic} from "../shared/models/diagnostic"
import { FunctionInfo } from '../shared/models/function-info';
import {UserService} from '../shared/services/user.service';
import {FunctionContainer} from '../shared/models/function-container';
import {FunctionsService} from '../shared/services/functions.service';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {ErrorEvent} from '../shared/models/error-event';
import {UtilitiesService} from '../shared/services/utilities.service';
import {GlobalStateService} from '../shared/services/global-state.service';
import { Observable } from 'rxjs/Observable';
import {HostEventService} from '../shared/services/host-event.service'
import {HostEvent} from '../shared/models/host-event'
import {MonacoEditorDirective} from '../shared/directives/monaco-editor.directive'
import {FileSelectionRequest} from '../shared/models/file-selection-request';
import {FunctionDevComponent} from '../function-dev/function-dev.component'
import {FileExplorerComponent} from '../file-explorer/file-explorer.component'
import {BusyStateComponent} from '../busy-state/busy-state.component'

@Component({
    selector: 'errors-warnings',
    templateUrl: './errors-warnings.component.html',
    styleUrls: ['./errors-warnings.component.scss', '../function-dev/function-dev.component.scss']
})
export class ErrorsWarningsComponent implements OnInit, OnChanges, OnDestroy {
    public diagnostics: any[] = [];
    private token: string;
    private tokenSubscription: Subscription;
    private hostEventSubscription: Subscription;
    private skipLength: number = 0;
    private static functionsDiagnostics: any = {};
    private functionDevComponent: FunctionDevComponent;
    private codeColumnWidth: number = 75;
    private msgColumnWidth: number;
    private sourceColumnWidth: number = 125;
    private startLineNumberColumnWidth: number = 50;
    private startColumnColumnWidth: number = 75;
    private pendingFileChange: string;
    @Input() functionInfo: FunctionInfo;
    @Input() monacoEditor: MonacoEditorDirective;
    @Input() fileExplorer: FileExplorerComponent;
    @Output() closeClicked = new EventEmitter<any>();
    @Output() expandClicked = new EventEmitter<boolean>();
    @Output() diagnosticDblClicked = new EventEmitter<any>();
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;

    constructor(
        private _hostEventService: HostEventService,
        private _userService: UserService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService) {
        this.tokenSubscription = this._userService.getStartupInfo().subscribe(s => this.token = s.token);
        this.hostEventSubscription = this._hostEventService.Events.retry().subscribe((r : any) => {
            ErrorsWarningsComponent.functionsDiagnostics[r.functionName] = r.diagnostics;
            if (this.functionInfo && this.functionInfo.name === r.functionName) {
                this.diagnostics = r.diagnostics;
                this.monacoEditor.setDiagnostics(this.diagnostics);
                this.clearBusyState();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        
        if (this.functionInfo && ErrorsWarningsComponent.functionsDiagnostics[this.functionInfo.name]) {
            this.diagnostics = ErrorsWarningsComponent.functionsDiagnostics[this.functionInfo.name];
        }
        else {
            this.diagnostics = [];
        }

        this.monacoEditor.setDiagnostics(this.diagnostics);
        if(this.fileExplorer && this.pendingFileChange){
            this.changeFiles(this.pendingFileChange);
            this.pendingFileChange = null;
        }
    }

    ngOnInit(): void {
        this.monacoEditor.onSave.subscribe(()=> {
            this.diagnostics =[]
            this.monacoEditor.setDiagnostics(this.diagnostics);
            this.setBusyState();
        });

        this.monacoEditor.onContentChanged.subscribe(n=> {
            this.monacoEditor.setDiagnostics(this.diagnostics);
        });

        this._broadcastService.subscribe(BroadcastEvent.FileSelectionRequest, () => {
            this.monacoEditor.setDiagnostics(this.diagnostics);
        })

        setTimeout(() => {
            this.onResize(null);
        }, 0); 
    }

    ngOnDestroy() {
        if (this.tokenSubscription) {
            this.tokenSubscription.unsubscribe();
            delete this.tokenSubscription;
        }

        if (this.hostEventSubscription) {
            this.hostEventSubscription.unsubscribe();
            delete this.hostEventSubscription;
        }
    }

    close() {
        this.closeClicked.emit(null);
    }

    onResize(ev : any){
        let table = document.getElementById("diagnostics-table");
        let severityColumnWidth = 50;
        let sumOtherColumns = severityColumnWidth + this.codeColumnWidth + this.sourceColumnWidth
                    + this.startLineNumberColumnWidth + this.startColumnColumnWidth;
        this.msgColumnWidth = table.clientWidth - sumOtherColumns;
    }

    setBusyState() {
        if (this.busyState) {
            this.busyState.setBusyState();
        }
    }

    clearBusyState() {
        if (this.busyState) {
            this.busyState.clearBusyState();
        }
    }

    public itemClick(diagnostic : Diagnostic) {
        if(this.monacoEditor.CurrentFileName !== diagnostic.source){
            if(!this.fileExplorer){
                this.diagnosticDblClicked.emit(null);
                this.pendingFileChange = diagnostic.source;
            }else{
                this.changeFiles(diagnostic.source);
            }

        }
        this.monacoEditor.setPosition(diagnostic.startLineNumber, diagnostic.startColumn);
    }

    private changeFiles(fileName : string){
        let requestedFile = this.fileExplorer.files.find((item, index, collection)=> item.name === fileName);
        if(requestedFile){
            this.fileExplorer.selectedFile = requestedFile;
            this.fileExplorer.selectVfsObject(requestedFile);
        }
    }

    private getSeverityClass(severity : monaco.Severity){
        var result : string;
        switch (severity) {
            case monaco.Severity.Error:
                result = "fa-times-circle severityerror";
                break;
            case monaco.Severity.Warning:
                result = "fa-exclamation-triangle severitywarning";
                break;
            case monaco.Severity.Info:
                result = "fa-info-circle severityinfo";
                break;
        }

        return "fa severitycolumn " + result;
    }
}