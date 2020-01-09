import { ExtendedTreeViewInfo } from './../shared/components/navigable-component';
import { ArmSiteDescriptor } from './../shared/resourceDescriptors';
import { FunctionAppContext } from './../shared/function-app-context';
import { FunctionInfo } from 'app/shared/models/function-info';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { errorIds } from './../shared/models/error-ids';
import { AppNode } from './../tree-view/app-node';
import { Component, OnDestroy, Injector } from '@angular/core';
import { FunctionNode } from './../tree-view/function-node';
import { FunctionsNode } from './../tree-view/functions-node';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../shared/models/portal-resources';
import { PortalService } from '../shared/services/portal.service';
import { Observable } from 'rxjs/Observable';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { NavigableComponent } from '../shared/components/navigable-component';
import { FunctionService } from 'app/shared/services/function.service';
import { FunctionAppVersion } from 'app/shared/models/constants';

@Component({
  selector: 'functions-list',
  templateUrl: './functions-list.component.html',
  styleUrls: ['./functions-list.component.scss'],
})
export class FunctionsListComponent extends NavigableComponent implements OnDestroy {
  public functions: FunctionNode[] = [];
  public isLoading: boolean;
  public appNode: AppNode;
  public runtimeVersion: string;
  public context: FunctionAppContext;

  // TODO: ellhamai - need to set this or have child component set this
  public functionsInfo: FunctionInfo[] = null;

  private _functionsNode: FunctionsNode;

  constructor(
    private _portalService: PortalService,
    private _translateService: TranslateService,
    private _functionAppService: FunctionAppService,
    private _functionService: FunctionService,
    injector: Injector
  ) {
    super('functions-list', injector, DashboardType.FunctionsDashboard);
  }

  setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
    return super
      .setup(navigationEvents)
      .switchMap(viewInfo => {
        this.clearBusyEarly();
        this.isLoading = true;
        this._functionsNode = <FunctionsNode>viewInfo.node;
        this.appNode = <AppNode>viewInfo.node.parent;
        const descriptor = ArmSiteDescriptor.getSiteDescriptor(viewInfo.resourceId);
        return this._functionAppService.getAppContext(descriptor.getTrimmedResourceId());
      })
      .switchMap(context => {
        this.context = context;
        return Observable.zip(this._functionsNode.loadChildren(), this._functionAppService.getRuntimeGeneration(this.context));
      })
      .do(tuple => {
        this.runtimeVersion = tuple[1];
        this.isLoading = false;
        this.functions = <FunctionNode[]>this._functionsNode.children;
        this.functionsInfo = this._functionsNode.children.map((child: FunctionNode) => {
          return child.functionInfo;
        });
      });
  }

  clickRow(item: FunctionNode) {
    item.select();
  }

  enableChange(item: FunctionNode, enabled: boolean) {
    item.functionInfo.config.disabled = !enabled;
    this.setBusy();
    item.functionInfo.config.disabled
      ? this._portalService.logAction('function-list', 'disable')
      : this._portalService.logAction('function-list', 'enable');

    const observable =
      this.runtimeVersion !== FunctionAppVersion.v1
        ? this._functionAppService.updateDisabledAppSettings(this.context, [item.functionInfo])
        : this._functionService.updateFunction(this.context.site.id, item.functionInfo);

    return observable
      .do(null, e => {
        item.functionInfo.config.disabled = !item.functionInfo.config.disabled;
        const state = item.functionInfo.config.disabled
          ? this._translateService.instant(PortalResources.enable)
          : this._translateService.instant(PortalResources.disable);
        this.showComponentError({
          message: this._translateService.instant(PortalResources.failedToSwitchFunctionState, {
            state: state,
            functionName: item.functionInfo.name,
          }),
          errorId: errorIds.failedToSwitchEnabledFunction,
          resourceId: this.context.site.id,
        });
        this.clearBusy();
        console.error(e);
      })
      .subscribe(() => {
        this.clearComponentErrors();
        this.clearBusy();
      });
  }

  clickDelete(item: FunctionNode) {
    const functionInfo = item.functionInfo;
    const result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: functionInfo.name }));
    if (result) {
      this.setBusy();
      this._portalService.logAction('function-list', 'delete');
      this._functionService
        .deleteFunction(this.context.site.id, functionInfo.name)
        .do(null, e => {
          this.clearBusy();
          console.error(e);
        })
        .subscribe(() => {
          const indexToDelete = this.functions.indexOf(item);
          if (indexToDelete > -1) {
            this.functions.splice(indexToDelete, 1);
          }

          const resourceId = `${this._functionsNode.resourceId}/${item.functionInfo.name}`;
          this._functionsNode.removeChild(resourceId, false);

          const defaultHostName = this.context.site.properties.defaultHostName;
          const scmHostName = this.context.scmUrl;

          item.sideNav.cacheService.clearCachePrefix(`https://${defaultHostName}`);
          item.sideNav.cacheService.clearCachePrefix(`https://${scmHostName}`);

          this.clearBusy();
        });
    }
  }

  searchChanged(value: string) {
    this.functions = (<FunctionNode[]>this._functionsNode.children).filter(c => {
      return c.functionInfo.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
    });
  }

  searchCleared() {
    this.functions = <FunctionNode[]>this._functionsNode.children;
  }

  onNewFunctionClick() {
    this._functionsNode.openCreateDashboard(DashboardType.CreateFunctionDashboard);
  }
}
