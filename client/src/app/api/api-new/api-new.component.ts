import { ExtendedTreeViewInfo } from './../../shared/components/navigable-component';
import { FunctionAppService } from './../../shared/services/function-app.service';
import { FunctionAppContext } from './../../shared/function-app-context';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { Component, ViewChild, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { AppNode } from './../../tree-view/app-node';
import { AiService } from './../../shared/services/ai.service';
import { ApiProxy } from '../../shared/models/api-proxy';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { PortalResources } from '../../shared/models/portal-resources';
import { ProxiesNode } from '../../tree-view/proxies-node';
import { FunctionInfo } from '../../shared/models/function-info';
import { errorIds } from '../../shared/models/error-ids';
import { RequestResposeOverrideComponent } from '../request-respose-override/request-respose-override.component';
import { NavigableComponent } from '../../shared/components/navigable-component';
import { SiteService } from '../../shared/services/site.service';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { FunctionService } from 'app/shared/services/function.service';
import { PortalService } from '../../shared/services/portal.service';

@Component({
  selector: 'api-new',
  templateUrl: './api-new.component.html',
  styleUrls: ['../../binding-input/binding-input.component.css', './api-new.component.scss'],
})
export class ApiNewComponent extends NavigableComponent {
  @ViewChild(RequestResposeOverrideComponent)
  rrComponent: RequestResposeOverrideComponent;
  complexForm: FormGroup;
  isMethodsVisible = false;

  public context: FunctionAppContext;
  public apiProxies: ApiProxy[];
  public functionsInfo: ArmObj<FunctionInfo>[];
  public appNode: AppNode;
  public rrOverrideValid: boolean;

  private _proxiesNode: ProxiesNode;
  private _rrOverrideValue: any;

  static validateUrl(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (control.value) {
        const url: string = <string>control.value.toLowerCase();
        return url.startsWith('http://') || url.startsWith('https://')
          ? null
          : {
              validateName: {
                valid: false,
              },
            };
      } else {
        return null;
      }
    };
  }

  constructor(
    private _translateService: TranslateService,
    private _aiService: AiService,
    private _functionAppService: FunctionAppService,
    private _siteService: SiteService,
    private _functionService: FunctionService,
    private _portalService: PortalService,
    fb: FormBuilder,
    injector: Injector
  ) {
    super('api-new', injector, DashboardType.CreateProxyDashboard);

    this.complexForm = fb.group({
      // We can set default values by passing in the corresponding value or leave blank if we wish to not set the value.
      routeTemplate: [null, Validators.required],
      methodSelectionType: 'All',
      name: [null, Validators.compose([Validators.required, this.validateName(this)])],
      backendUri: [null, Validators.compose([ApiNewComponent.validateUrl()])],
      method_GET: false,
      method_POST: false,
      method_DELETE: false,
      method_HEAD: false,
      method_PATCH: false,
      method_PUT: false,
      method_OPTIONS: false,
      method_TRACE: false,
    });

    this.complexForm.controls['methodSelectionType'].valueChanges.subscribe(value => {
      this.isMethodsVisible = !(value === 'All');
    });
  }

  setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
    return super
      .setup(navigationEvents)
      .takeUntil(this.ngUnsubscribe)
      .switchMap(viewInfo => {
        this._proxiesNode = <ProxiesNode>viewInfo.node;
        if (this._proxiesNode) {
          // node = null for Ibizafication scenario
          this.appNode = <AppNode>this._proxiesNode.parent;
        }

        return this._functionAppService.getAppContext(viewInfo.siteDescriptor.getTrimmedResourceId()).concatMap(context => {
          // Should be okay to query app settings without checkout RBAC/locks since this component
          // shouldn't load unless you have write access.
          return Observable.zip(
            this._functionService.getFunctions(context.site.id),
            this._functionAppService.getApiProxies(context),
            this._siteService.getAppSettings(context.site.id),
            (f, p, a) => ({ fcs: f, proxies: p, appSettings: a, context: context })
          );
        });
      })
      .do(res => {
        this.context = res.context;
        if (res.fcs.isSuccessful) {
          this.functionsInfo = res.fcs.result.value;
        } else {
          this.showComponentError({
            errorId: res.fcs.error.errorId,
            message: res.fcs.error.message,
            resourceId: this.context.site.id,
          });
        }
        if (res.proxies.isSuccessful) {
          this.apiProxies = res.proxies.result;
        } else if (res.proxies.error.errorId === errorIds.proxyJsonNotFound) {
          this.apiProxies = [];
        } else {
          this.showComponentError({
            errorId: res.proxies.error.errorId,
            message: res.proxies.error.message,
            resourceId: this.context.site.id,
          });
        }
      });
  }

  onFunctionAppSettingsClicked() {
    this.appNode.openSettings();
  }

  validateName(that: ApiNewComponent): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      let existingProxy = null;
      let existingFunction = null;
      if (that.complexForm) {
        const name = control.value;

        if (name) {
          if (that.apiProxies && name) {
            existingProxy = that.apiProxies.find(p => {
              return p.name.toLowerCase() === name.toLowerCase();
            });
          }
          if (!existingProxy) {
            existingFunction = that.functionsInfo.find(f => {
              return f.name.toLowerCase() === name.toLowerCase();
            });
          }
        }
      }

      return existingProxy || existingFunction
        ? {
            validateName: {
              valid: false,
            },
          }
        : null;
    };
  }

  submitForm() {
    if (this.complexForm.valid && this.rrOverrideValid) {
      this.setBusy();

      const newApiProxy: ApiProxy = {
        name: this.complexForm.controls['name'].value,
        backendUri: this.complexForm.controls['backendUri'].value,
        matchCondition: {
          route: this.complexForm.controls['routeTemplate'].value,
          methods: [],
        },
      };

      this._functionAppService
        .getApiProxies(this.context)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(proxies => {
          // TODO: [alrod] handle error
          if (proxies.isSuccessful) {
            this.apiProxies = proxies.result;
          } else if (proxies.error.errorId === errorIds.proxyJsonNotFound) {
            this.apiProxies = [];
          }

          if (this.apiProxies.find(p => p.name === newApiProxy.name)) {
            this.clearBusy();
            // No need to log this error as this is just a user error.
            this.showComponentError({
              message: this._translateService.instant(PortalResources.apiProxy_alreadyExists, { name: newApiProxy.name }),
              errorId: errorIds.proxyWithSameNameAlreadyExists,
              resourceId: this.context.site.id,
            });

            throw new Error(`Proxy with name '${newApiProxy.name}' already exists`);
          } else {
            if (this.complexForm.controls['methodSelectionType'].value !== 'All') {
              for (const control in this.complexForm.controls) {
                if (control.startsWith('method_')) {
                  if (this.complexForm.controls[control].value) {
                    newApiProxy.matchCondition.methods.push(control.replace('method_', '').toUpperCase());
                  }
                }
              }
            }
          }

          // https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
          // we are using ES5 now
          if (this._rrOverrideValue) {
            for (const prop in this._rrOverrideValue) {
              if (this._rrOverrideValue.hasOwnProperty(prop)) {
                newApiProxy[prop] = this._rrOverrideValue[prop];
              }
            }
          }

          this.apiProxies.push(newApiProxy);

          this._functionAppService.saveApiProxy(this.context, ApiProxy.toJson(this.apiProxies, this._translateService)).subscribe(() => {
            this.clearBusy();
            this._aiService.trackEvent('/actions/proxy/create');
            if (this._proxiesNode) {
              // If someone refreshed the app, it would created a new set of child nodes under the app node.
              this._proxiesNode = <ProxiesNode>this.appNode.children.find(node => node.title === this._proxiesNode.title);
              this._proxiesNode.addChild(newApiProxy);
            } else {
              // Ibizafication Experience, open the Proxy-List tab
              this._portalService.closeSelf({ data: { ...newApiProxy } });
            }
          });
        });
    }
  }

  rrOverriedValueChanges(value: any) {
    this._rrOverrideValue = value;
    this.rrOverrideValid = this.rrComponent.valid;
  }
}
