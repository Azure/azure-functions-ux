import { EditModeHelper } from './../shared/Utilities/edit-mode.helper';
import { Observable } from 'rxjs/Observable';
import { errorIds } from './../shared/models/error-ids';
import {
  Component,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ViewChildren,
  ElementRef,
  Input,
  QueryList,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { PortalService } from '../shared/services/portal.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { GlobalStateService } from '../shared/services/global-state.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../shared/models/portal-resources';
import { Subject } from 'rxjs/Subject';
import { MonacoEditorDirective } from '../shared/directives/monaco-editor.directive';
import { MonacoHelper } from '../shared/Utilities/monaco.helper';
import { FunctionAppContext } from 'app/shared/function-app-context';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { ErrorableComponent } from '../shared/components/errorable-component';

@Component({
  selector: 'host-editor',
  templateUrl: './host-editor.component.html',
  styleUrls: ['./host-editor.component.scss'],
})
export class HostEditorComponent extends ErrorableComponent implements OnInit, OnDestroy {
  @ViewChild('container')
  container: ElementRef;
  @ViewChild('editorContainer')
  editorContainer: ElementRef;
  @ViewChildren(MonacoEditorDirective)
  monacoEditors: QueryList<MonacoEditorDirective>;
  @Output()
  changeEditor = new EventEmitter<string>();

  public configContent: string;
  public isDirty: boolean;
  public disabled: Observable<boolean>;
  public context: FunctionAppContext;

  private functionAppContextStream: Subject<FunctionAppContext>;
  private _originalContent: string;
  private _currentContent: string;

  constructor(
    private _portalService: PortalService,
    broadcastService: BroadcastService,
    private _globalStateService: GlobalStateService,
    private _functionAppService: FunctionAppService,
    private _translateService: TranslateService,
    private _ref: ChangeDetectorRef
  ) {
    super('host-editor', broadcastService);
    this.isDirty = false;

    this.functionAppContextStream = new Subject<FunctionAppContext>();
    this.functionAppContextStream
      .do(() => this._globalStateService.setBusyState())
      .switchMap(context => {
        this.context = context;
        return this._functionAppService.getHostV1Json(context);
      })
      .subscribe(hostJson => {
        const hostJsonResult = hostJson;
        if (hostJsonResult.isSuccessful) {
          this._originalContent = JSON.stringify(hostJson.result, undefined, 2);
          this._currentContent = this._originalContent;
          this.disabled = this._functionAppService
            .getFunctionAppEditMode(this.context)
            .map(r => (r.isSuccessful ? EditModeHelper.isReadOnly(r.result) : true));
        } else {
          this.disabled = Observable.of(true);
        }
        this.cancelConfig();
        this.clearDirty();
        this._globalStateService.clearBusyState();
      });
    this.onResize();
  }

  ngOnInit() {
    this.onResize();
  }

  @Input()
  set functionAppInput(value: FunctionAppContext) {
    this.functionAppContextStream.next(value);
  }

  contentChanged(content: string) {
    if (!this.isDirty) {
      this.isDirty = true;
      this._ref.detectChanges();
      this._broadcastService.setDirtyState('function');
      this._portalService.setDirtyState(true);
    }

    this._currentContent = content;
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
        this.configContent = this._currentContent;
        this._globalStateService.setBusyState();
        this._functionAppService.saveHostJson(this.context, JSON.parse(this.configContent)).subscribe(() => {
          this._originalContent = this.configContent;
          this.clearDirty();
          this._globalStateService.clearBusyState();
        });

        this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, errorIds.errorParsingConfig);
      } catch (e) {
        this.showComponentError({
          message: this._translateService.instant(PortalResources.errorParsingConfig, { error: e }),
          errorId: errorIds.errorParsingConfig,
          resourceId: this.context.site.id,
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
