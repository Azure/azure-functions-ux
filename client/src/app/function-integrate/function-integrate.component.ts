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
  QueryList,
  OnInit,
  Injector,
} from '@angular/core';
import { FunctionInfo } from '../shared/models/function-info';
import { PortalService } from '../shared/services/portal.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../shared/models/portal-resources';
import { MonacoEditorDirective } from '../shared/directives/monaco-editor.directive';
import { MonacoHelper } from '../shared/Utilities/monaco.helper';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { BaseFunctionComponent } from '../shared/components/base-function-component';
import { ExtendedTreeViewInfo } from '../shared/components/navigable-component';

@Component({
  selector: 'function-integrate',
  templateUrl: './function-integrate.component.html',
  styleUrls: ['./function-integrate.component.scss'],
})
export class FunctionIntegrateComponent extends BaseFunctionComponent implements OnInit, OnDestroy {
  @ViewChild('container')
  container: ElementRef;
  @ViewChild('editorContainer')
  editorContainer: ElementRef;
  @ViewChildren(MonacoEditorDirective)
  monacoEditors: QueryList<MonacoEditorDirective>;
  @Output()
  changeEditor = new EventEmitter<string>();

  public _selectedFunction: FunctionInfo;
  public configContent: string;
  public isDirty: boolean;
  public disabled: Observable<boolean>;

  private _originalContent: string;
  private _currentContent: string;

  constructor(
    private _portalService: PortalService,
    broadcastService: BroadcastService,
    private _translateService: TranslateService,
    injector: Injector
  ) {
    super('function-integrate', injector, DashboardType.FunctionIntegrateDashboard);

    this.isDirty = false;
    this.onResize();
  }

  setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
    return super.setup(navigationEvents).do(view => {
      this.disabled = this._functionAppService.getFunctionAppEditMode(view.context).map(r => {
        if (r.isSuccessful) {
          return EditModeHelper.isReadOnly(r.result);
        } else {
          throw r.error;
        }
      });

      if (view.functionInfo.isSuccessful) {
        this._selectedFunction = view.functionInfo.result.properties;
        this._originalContent = JSON.stringify(this._selectedFunction.config, undefined, 2);
        this._currentContent = this._originalContent;
        this.cancelConfig();
        this.isDirty = false;
      }
    });
  }

  ngOnInit() {
    this.onResize();
  }

  contentChanged(content: string) {
    if (!this.isDirty) {
      this.isDirty = true;
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
        this._selectedFunction.config = JSON.parse(this.configContent);
        this.setBusy();
        this._functionService.updateFunction(this.context.site.id, this._selectedFunction).subscribe(() => {
          this._originalContent = this.configContent;
          this.clearDirty();
          this.clearBusy();
          this._broadcastService.broadcast(BroadcastEvent.FunctionUpdated, this._selectedFunction);
        });
        this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, errorIds.errorParsingConfig);
      } catch (e) {
        this.showComponentError({
          message: this._translateService.instant(PortalResources.errorParsingConfig, { error: e }),
          errorId: errorIds.errorParsingConfig,
          resourceId: this.context.site.id,
        });
      }
    }
  }

  ngOnDestroy() {
    this._broadcastService.clearDirtyState('function');
    this._portalService.setDirtyState(false);
    super.ngOnDestroy();
  }

  onEditorChange(editorType: string) {
    if (this.switchIntegrate()) {
      this._broadcastService.clearDirtyState('function_integrate', true);
      this._portalService.setDirtyState(false);
      this.changeEditor.emit(editorType);
    }
  }

  private clearDirty() {
    if (this.isDirty) {
      this.isDirty = false;
      this._broadcastService.clearDirtyState('function');
      this._portalService.setDirtyState(false);
    }
  }

  private switchIntegrate() {
    let result = true;
    if (this._broadcastService.getDirtyState('function') || this._broadcastService.getDirtyState('function_integrate')) {
      result = confirm(
        this._translateService.instant(PortalResources.functionIntegrate_changesLost2, { name: this._selectedFunction.name })
      );
    }
    return result;
  }

  onResize() {
    MonacoHelper.onResize(this.container, this.editorContainer, this.functionEditor);
  }

  get functionEditor(): MonacoEditorDirective {
    return MonacoHelper.getMonacoDirective('function', this.monacoEditors);
  }
}
