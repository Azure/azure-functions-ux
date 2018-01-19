import { EditModeHelper } from './../shared/Utilities/edit-mode.helper';
import { Observable } from 'rxjs/Observable';
import { FunctionApp } from './../shared/function-app';
import { ErrorIds } from './../shared/models/error-ids';
import { Component, OnDestroy, Output, EventEmitter, ViewChild, ViewChildren, ElementRef, Input, QueryList } from '@angular/core';
import { PortalService } from '../shared/services/portal.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';
import { GlobalStateService } from '../shared/services/global-state.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../shared/models/portal-resources';
import { Subject } from 'rxjs/Subject';
import { MonacoEditorDirective } from '../shared/directives/monaco-editor.directive';
import { MonacoHelper } from '../shared/Utilities/monaco.helper';

@Component({
    selector: 'host-editor',
    templateUrl: './host-editor.component.html',
    styleUrls: ['./host-editor.component.scss']
})
export class HostEditorComponent implements OnDestroy {
    @ViewChild('container') container: ElementRef;
    @ViewChild('editorContainer') editorContainer: ElementRef;
    @ViewChildren(MonacoEditorDirective) monacoEditors: QueryList<MonacoEditorDirective>;
    @Output() changeEditor = new EventEmitter<string>();

    public configContent: string;
    public isDirty: boolean;
    private _originalContent: string;
    private _currentConent: string;
    public disabled: Observable<boolean>;
    public functionApp: FunctionApp;
    private functionAppInputStream: Subject<FunctionApp>;

    constructor(
        private _portalService: PortalService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) {
        this.isDirty = false;

        this.functionAppInputStream = new Subject<FunctionApp>();
        this.functionAppInputStream
            .do( fa => {
                this.functionApp = fa;
                this.disabled = Observable.of(true);
                this._globalStateService.setBusyState();
            })
            .switchMap(() => this.functionApp.getHostJson())
            .subscribe(hostJson => {
                this._originalContent = JSON.stringify(hostJson, undefined, 2);
                this._currentConent = this._originalContent;
                this.disabled = this.functionApp.getFunctionAppEditMode().map(EditModeHelper.isReadOnly);
                this.cancelConfig();
                this.clearDirty();
                this._globalStateService.clearBusyState();
            });
            this.onResize();
    }

    ngOnInit() {
        this.onResize();
    }

    @Input() set functionAppInput(value: FunctionApp) {
        this.functionAppInputStream.next(value);
    }

    contentChanged(content: string) {
        if (!this.isDirty) {
            this.isDirty = true;
            this._broadcastService.setDirtyState('function');
            this._portalService.setDirtyState(true);
        }

        this._currentConent = content;
    }

    cancelConfig() {
        this.configContent = '';
        setTimeout(() => {
            this.configContent = this._originalContent;
            this.clearDirty();
        }, 0);
    }

    saveConfig() {
        if (this.isDirty) {
            try {
                this.configContent = this._currentConent;
                this._globalStateService.setBusyState();
                this.functionApp.saveHostJson(JSON.parse(this.configContent))
                    .subscribe(() => {
                        this._originalContent = this.configContent;
                        this.clearDirty();
                        this._globalStateService.clearBusyState();
                    });

                this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.errorParsingConfig);
            } catch (e) {
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: this._translateService.instant(PortalResources.errorParsingConfig, { error: e }),
                    errorId: ErrorIds.errorParsingConfig,
                    errorType: ErrorType.UserError,
                    resourceId: this.functionApp.site.id
                });
                this._globalStateService.clearBusyState();
            }
        }
    }

    ngOnDestroy() {
        this._broadcastService.clearDirtyState('function');
        this._portalService.setDirtyState(false);
    }

    private clearDirty() {
        if (this.isDirty) {
            this.isDirty = false;
            this._broadcastService.clearDirtyState('function');
            this._portalService.setDirtyState(false);
        }
    }

    onResize() {
        MonacoHelper.onResize(this.container, this.editorContainer, this.hostEditor);
    }

    private get hostEditor(): MonacoEditorDirective {
        return MonacoHelper.getMonacoDirective('host', this.monacoEditors);
    }
}
