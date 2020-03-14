import { FunctionAppService } from './../../shared/services/function-app.service';
import { FunctionAppContext } from './../../shared/function-app-context';
import { TreeUpdateEvent } from './../../shared/models/broadcast-event';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { Observable } from 'rxjs/Observable';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { Component, ViewChild, OnDestroy, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiProxy } from '../../shared/models/api-proxy';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiNewComponent } from '../api-new/api-new.component';
import { ProxiesNode } from '../../tree-view/proxies-node';
import { AppNode } from '../../tree-view/app-node';
import { ProxyNode } from '../../tree-view/proxy-node';
import { AiService } from '../../shared/services/ai.service';
import { RequestResposeOverrideComponent } from '../request-respose-override/request-respose-override.component';
import { ArmSiteDescriptor } from '../../shared/resourceDescriptors';
import { NavigableComponent, ExtendedTreeViewInfo } from '../../shared/components/navigable-component';
import { SiteService } from '../../shared/services/site.service';
import { PortalService } from '../../shared/services/portal.service';

@Component({
  selector: 'api-details',
  templateUrl: './api-details.component.html',
  styleUrls: ['../api-new/api-new.component.scss', '../../binding-input/binding-input.component.css'],
})
export class ApiDetailsComponent extends NavigableComponent implements OnDestroy {
  @ViewChild(RequestResposeOverrideComponent)
  rrComponent: RequestResposeOverrideComponent;
  complexForm: FormGroup;
  isMethodsVisible = false;
  proxyUrl: string;

  public context: FunctionAppContext;
  public apiProxies: ApiProxy[];
  public apiProxyEdit: ApiProxy;
  public appNode: AppNode;
  public rrOverrideValid: boolean;

  private selectedNode: ProxyNode;
  private proxiesNode: ProxiesNode;
  private _rrOverrideValue: any;

  constructor(
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _aiService: AiService,
    private _functionAppService: FunctionAppService,
    private _siteService: SiteService,
    private _portalService: PortalService,
    injector: Injector
  ) {
    super('api-details', injector, DashboardType.ProxyDashboard);

    this.initComplexFrom();
  }

  setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
    return super
      .setup(navigationEvents)
      .switchMap(viewInfo => {
        if (viewInfo.node) {
          this.selectedNode = <ProxyNode>viewInfo.node;
          this.proxiesNode = <ProxiesNode>this.selectedNode.parent;
          this.apiProxyEdit = this.selectedNode.proxy;
        } else {
          this.apiProxyEdit = <ApiProxy>viewInfo.data;
        }

        const siteDescriptor = new ArmSiteDescriptor(viewInfo.resourceId);
        return this._functionAppService.getAppContext(siteDescriptor.getTrimmedResourceId()).concatMap(context => {
          this.context = context;
          this.initEdit();
          return Observable.zip(this._functionAppService.getApiProxies(context), this._siteService.getAppSettings(context.site.id));
        });
      })
      .do(r => {
        this.apiProxies = r[0].isSuccessful ? r[0].result : [];
      });
  }

  onFunctionAppSettingsClicked() {
    (<AppNode>this.proxiesNode.parent).openSettings();
  }

  private initEdit() {
    this.complexForm.patchValue({
      backendUri: this.apiProxyEdit.backendUri,
      routeTemplate: this.apiProxyEdit.matchCondition.route,
      methodSelectionType:
        !this.apiProxyEdit.matchCondition.methods || this.apiProxyEdit.matchCondition.methods.length === 0 ? 'All' : 'Selected',
    });

    let route = this.apiProxyEdit.matchCondition.route ? this.apiProxyEdit.matchCondition.route : '/api/' + this.apiProxyEdit.name;
    if (!route.startsWith('/')) {
      route = '/' + route;
    }

    this.proxyUrl = `${this.context.mainSiteUrl}` + route;

    const methods = {};
    methods['method_GET'] = false;
    methods['method_POST'] = false;
    methods['method_DELETE'] = false;
    methods['method_HEAD'] = false;
    methods['method_PATCH'] = false;
    methods['method_PUT'] = false;
    methods['method_OPTIONS'] = false;
    methods['method_TRACE'] = false;

    if (this.apiProxyEdit.matchCondition.methods) {
      this.apiProxyEdit.matchCondition.methods.forEach(m => {
        methods['method_' + m.toUpperCase()] = true;
      });

      this.complexForm.patchValue(methods);
    }
  }

  deleteProxyClicked() {
    this.setBusy();
    this._functionAppService
      .getApiProxies(this.context)
      .concatMap(proxies => {
        this.apiProxies = proxies.isSuccessful ? proxies.result : [];
        const indexToDelete = this.apiProxies.findIndex(p => {
          return p.name === this.apiProxyEdit.name;
        });

        this.apiProxies.splice(indexToDelete, 1);

        return this._functionAppService.saveApiProxy(this.context, ApiProxy.toJson(this.apiProxies, this._translateService));
      })
      .subscribe(() => {
        this.clearBusy();
        this._aiService.trackEvent('/actions/proxy/delete');
        this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
          operation: 'remove',
          resourceId: `${this.context.site.id}/proxies/${this.apiProxyEdit.name}`,
        });

        if (this.proxiesNode) {
          this.proxiesNode.select();
        } else {
          this._portalService.closeSelf({ data: { ...this.apiProxyEdit } });
        }
      });
  }

  onCancelClick() {
    this.apiProxyEdit = this.apiProxyEdit;
  }

  onReset() {
    this.initComplexFrom();
    this.initEdit();
    this._broadcastService.clearDirtyState('api-proxy', true);
    if (this.rrComponent) {
      this.rrComponent.discard();
    }
  }

  submitForm() {
    if (this.complexForm.valid && this.rrOverrideValid) {
      this.setBusy();

      this.apiProxyEdit.backendUri = this.complexForm.controls['backendUri'].value;
      this.apiProxyEdit.matchCondition.route = this.complexForm.controls['routeTemplate'].value;
      this.apiProxyEdit.matchCondition.methods = [];

      this._functionAppService
        .getApiProxies(this.context)
        .concatMap(proxies => {
          this.apiProxies = proxies.isSuccessful ? proxies.result : [];
          const index = this.apiProxies.findIndex(p => {
            return p.name === this.apiProxyEdit.name;
          });

          if (index > -1) {
            if (this.complexForm.controls['methodSelectionType'].value !== 'All') {
              for (const control in this.complexForm.controls) {
                if (control.startsWith('method_')) {
                  if (this.complexForm.controls[control].value) {
                    this.apiProxyEdit.matchCondition.methods.push(control.replace('method_', '').toUpperCase());
                  }
                }
              }
            }

            // https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
            // we are using ES5 now
            if (this._rrOverrideValue) {
              delete this.apiProxyEdit.requestOverrides;
              delete this.apiProxyEdit.responseOverrides;
              for (const prop in this._rrOverrideValue) {
                if (this._rrOverrideValue.hasOwnProperty(prop)) {
                  this.apiProxyEdit[prop] = this._rrOverrideValue[prop];
                }
              }
            }

            this.apiProxies[index] = this.apiProxyEdit;
          }

          return this._functionAppService.saveApiProxy(this.context, ApiProxy.toJson(this.apiProxies, this._translateService));
        })
        .subscribe(() => {
          this.clearBusy();
          if (this.rrComponent) {
            this.rrComponent.saveModel();
          }
          this.onReset();
        });
    }
  }

  private initComplexFrom() {
    this.complexForm = this._fb.group({
      routeTemplate: [null, Validators.required],
      methodSelectionType: 'All',
      backendUri: [null, Validators.compose([ApiNewComponent.validateUrl()])],
      proxyUrl: '',
      method_GET: false,
      method_POST: false,
      method_DELETE: false,
      method_HEAD: false,
      method_PATCH: false,
      method_PUT: false,
      method_OPTIONS: false,
      method_TRACE: false,
    });

    this.complexForm.controls['methodSelectionType'].valueChanges.takeUntil(this.ngUnsubscribe).subscribe(value => {
      this.isMethodsVisible = !(value === 'All');
    });

    this.complexForm.valueChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
      if (this.complexForm.dirty) {
        this._broadcastService.setDirtyState('api-proxy');
      }
    });

    // this.isEnabled = this._globalStateService.IsRoutingEnabled;
  }

  openAdvancedEditor() {
    window.open(`${this.context.scmUrl}/dev/wwwroot/proxies.json`);
  }

  rrOverriedValueChanges(value: any) {
    setTimeout(() => {
      if (this.rrComponent) {
        this._rrOverrideValue = value;
        this.rrOverrideValid = this.rrComponent.valid;
        if (this.rrComponent.dirty) {
          this._broadcastService.setDirtyState('api-proxy');
          this.complexForm.markAsDirty();
        }
      }
    });
  }
}
