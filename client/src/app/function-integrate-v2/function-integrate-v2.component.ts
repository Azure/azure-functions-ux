import { Component, ElementRef, Inject, Output, EventEmitter, Injector } from '@angular/core';
import { BindingList } from '../shared/models/binding-list';
import { UIFunctionBinding, DirectionType, Action } from '../shared/models/binding';
import { BindingManager } from '../shared/models/binding-manager';
import { FunctionInfo, FunctionInfoHelper } from '../shared/models/function-info';
import { TemplatePickerType } from '../shared/models/template-picker';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { PortalService } from '../shared/services/portal.service';
import { GlobalStateService } from '../shared/services/global-state.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../shared/models/portal-resources';
import { errorIds } from '../shared/models/error-ids';
import { FunctionsNode } from '../tree-view/functions-node';
import { DashboardType } from '../tree-view/models/dashboard-type';
import { Observable } from 'rxjs/Observable';
import { BaseFunctionComponent } from '../shared/components/base-function-component';
import { ExtendedTreeViewInfo } from '../shared/components/navigable-component';

@Component({
  selector: 'function-integrate-v2',
  templateUrl: './function-integrate-v2.component.html',
  styleUrls: ['./function-integrate-v2.component.scss'],
})
export class FunctionIntegrateV2Component extends BaseFunctionComponent {
  @Output()
  save = new EventEmitter<FunctionInfo>();
  @Output()
  changeEditor = new EventEmitter<string>();

  public model: BindingList = new BindingList();
  public pickerType: TemplatePickerType = TemplatePickerType.none;
  public behavior: DirectionType;
  public currentBinding: UIFunctionBinding = null;
  public currentBindingId = '';
  public functionInfo: FunctionInfo;

  private _bindingManager: BindingManager = new BindingManager();

  constructor(
    @Inject(ElementRef) elementRef: ElementRef,
    private _portalService: PortalService,
    private _globalStateService: GlobalStateService,
    private _translateService: TranslateService,
    injector: Injector
  ) {
    super('function-integrate-v2', injector, DashboardType.FunctionIntegrateDashboard);
  }

  setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
    return super
      .setup(navigationEvents)
      .switchMap(view => {
        if (view.functionInfo.isSuccessful) {
          try {
            this._bindingManager.validateConfig(view.functionInfo.result.properties.config, this._translateService);
            return Observable.zip(
              this._functionAppService.getBindingConfig(view.context),
              this._functionAppService.getTemplates(view.context),
              Observable.of(view)
            );
          } catch (e) {
            this.onEditorChange('advanced');
            return Observable.of([]);
          }
        } else {
          return Observable.zip(
            this._functionAppService.getBindingConfig(view.context),
            this._functionAppService.getTemplates(view.context),
            Observable.of(view)
          );
        }
      })
      .do(tuple => {
        this.pickerType = TemplatePickerType.none;

        this.currentBinding = null;
        this.currentBindingId = '';

        if (tuple && tuple.length > 0) {
          const bindings = tuple[0];
          const viewInfo = tuple[2];
          if (viewInfo.functionInfo.isSuccessful && bindings.isSuccessful) {
            this.functionInfo = viewInfo.functionInfo.result.properties;
            this.model.config = this._bindingManager.functionConfigToUI(this.functionInfo.config, bindings.result.bindings);
            if (this.model.config.bindings.length > 0) {
              this.currentBinding = this.model.config.bindings[0];
              this.currentBindingId = this.currentBinding.id;
            }
            this.model.setBindings();
          }
        }
      });
  }

  newBinding(type: 'trigger' | 'in' | 'out' | 'inout') {
    if (!this.checkDirty()) {
      return;
    }

    this.currentBindingId = type.toString();

    switch (type) {
      case 'in':
        this.pickerType = TemplatePickerType.in;
        break;
      case 'out':
        this.pickerType = TemplatePickerType.out;
        break;
      case 'trigger':
        this.pickerType = TemplatePickerType.trigger;
        break;
    }

    this.behavior = <any>type;
    this.currentBinding = null;
  }

  onBindingCreateComplete(behavior: DirectionType, templateName: string) {
    this._functionAppService.getBindingConfig(this.context).subscribe(bindings => {
      if (bindings.isSuccessful) {
        this._broadcastService.setDirtyState('function_integrate');
        this._portalService.setDirtyState(true);

        this.currentBinding = this._bindingManager.getDefaultBinding(
          BindingManager.getBindingType(templateName),
          behavior,
          bindings.result.bindings,
          this._globalStateService.DefaultStorageAccount
        );
        this.currentBinding.newBinding = true;

        this.currentBindingId = this.currentBinding.id;
        this.model.setBindings();
        this.pickerType = TemplatePickerType.none;
      }
    });
  }

  onBindingCreateCancel() {
    this.pickerType = TemplatePickerType.none;
    this.currentBindingId = '';
  }

  onRemoveBinding(binding: UIFunctionBinding) {
    this.model.removeBinding(binding.id);
    this.currentBinding = null;
    this.model.setBindings();
    this.updateFunction();
  }

  onGo(action: Action) {
    if (!this.checkDirty()) {
      return;
    }
    this._functionAppService.getTemplates(this.context).subscribe(templates => {
      if (templates.isSuccessful) {
        let templateId = action.template + '-' + FunctionInfoHelper.getLanguage(this.functionInfo);
        let template = templates.result.find(t => t.id === templateId);
        // C# is default language. Set C# if can not found original language
        if (!template) {
          templateId = action.template + '-CSharp';
          template = templates.result.find(t => t.id === templateId);
        }
        if (template) {
          action.templateId = templateId;
          (<FunctionsNode>this.viewInfo.node.parent.parent).openCreateDashboard(DashboardType.CreateFunctionDashboard, action);
        }
      }
    });
  }

  onUpdateBinding(binding: UIFunctionBinding) {
    this.model.updateBinding(binding);
    this.model.setBindings();

    try {
      this.updateFunction();
      this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, errorIds.errorParsingConfig);
    } catch (e) {
      this.showComponentError({
        message: this._translateService.instant(PortalResources.errorParsingConfig, { error: e }),
        errorId: errorIds.errorParsingConfig,
        resourceId: this.context.site.id,
      });
      this.onRemoveBinding(binding);
    }
  }

  onCancel() {
    this.currentBinding = null;
    this.currentBindingId = '';
  }

  onBindingSelect(id: string) {
    if (!this.checkDirty()) {
      return;
    }
    if (this.currentBinding && id === this.currentBinding.id) {
      return;
    }

    this.pickerType = TemplatePickerType.none;
    this.currentBinding = this.model.getBinding(id);
    this.currentBindingId = this.currentBinding.id;
  }

  onEditorChange(editorType: string) {
    if (this.switchIntegrate()) {
      this._broadcastService.clearDirtyState('function_integrate', true);
      setTimeout(() => {
        this.changeEditor.emit(editorType);
      }, 10);
    }
  }

  private updateFunction() {
    this.functionInfo.config = this._bindingManager.UIToFunctionConfig(this.model.config);
    this._bindingManager.validateConfig(this.functionInfo.config, this._translateService);

    // Update test_data only from develop tab
    const functionInfoCopy: FunctionInfo = Object.assign({}, this.functionInfo);
    delete functionInfoCopy.test_data;

    this._globalStateService.setBusyState();
    this._functionService.updateFunction(this.context.site.id, this.functionInfo).subscribe(() => {
      this._globalStateService.clearBusyState();
      this._broadcastService.broadcast(BroadcastEvent.FunctionUpdated, this.functionInfo);
    });
  }

  private checkDirty(): boolean {
    let switchBinding = true;
    if (this._broadcastService.getDirtyState('function_integrate')) {
      switchBinding = confirm(this._translateService.instant(PortalResources.functionIntegrate_changesLost1));
    }

    if (switchBinding) {
      this._broadcastService.clearDirtyState('function_integrate', true);
    }
    return switchBinding;
  }

  private switchIntegrate() {
    let result = true;
    if (this._broadcastService.getDirtyState('function') || this._broadcastService.getDirtyState('function_integrate')) {
      result = confirm(this._translateService.instant(PortalResources.functionIntegrate_changesLost2, { name: this.functionInfo.name }));
    }
    return result;
  }
}
