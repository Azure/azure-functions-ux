import { FunctionAppContext } from './../shared/function-app-context';
import { SiteDescriptor } from 'app/shared/resourceDescriptors';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { errorIds } from './../shared/models/error-ids';
import { BroadcastService } from './../shared/services/broadcast.service';
import { AppNode } from './../tree-view/app-node';
import { Component, OnDestroy } from '@angular/core';
import { FunctionNode } from './../tree-view/function-node';
import { FunctionsNode } from './../tree-view/functions-node';
import { GlobalStateService } from '../shared/services/global-state.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../shared/models/portal-resources';
import { PortalService } from '../shared/services/portal.service';
import { Observable } from 'rxjs/Observable';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { Subscription } from 'rxjs/Subscription';
import { NavigableComponent } from '../shared/components/navigable-component';

@Component({
    selector: 'functions-list',
    templateUrl: './functions-list.component.html',
    styleUrls: ['./functions-list.component.scss']
})
export class FunctionsListComponent extends NavigableComponent implements OnDestroy {
    public functions: FunctionNode[] = [];
    public isLoading: boolean;
    public appNode: AppNode;
    public runtimeVersion: string;
    public context: FunctionAppContext;

    private _functionsNode: FunctionsNode;

    constructor(private _globalStateService: GlobalStateService,
        private _portalService: PortalService,
        private _translateService: TranslateService,
        broadcastService: BroadcastService,
        private _functionAppService: FunctionAppService) {
        super('functions-list', broadcastService, DashboardType.FunctionsDashboard);
    }

    setupNavigation(): Subscription {
        return this.navigationEvents
            .switchMap(viewInfo => {
                this.isLoading = true;
                this._functionsNode = (<FunctionsNode>viewInfo.node);
                this.appNode = (<AppNode>viewInfo.node.parent);
                const descriptor = new SiteDescriptor(viewInfo.resourceId);
                return this._functionAppService.getAppContext(descriptor.getTrimmedResourceId());
            })
            .switchMap(context => {
                this.context = context;
                return Observable.zip(
                    this._functionsNode.loadChildren(),
                    this._functionAppService.getRuntimeGeneration(this.context));
            })
            .subscribe(tuple => {
                this.runtimeVersion = tuple[1];
                this.isLoading = false;
                this.functions = (<FunctionNode[]>this._functionsNode.children);
            });
    }

    clickRow(item: FunctionNode) {
        item.select();
    }

    enableChange(item: FunctionNode, enabled: boolean) {
        item.functionInfo.config.disabled = !enabled;
        this._globalStateService.setBusyState();
        item.functionInfo.config.disabled
            ? this._portalService.logAction('function-list', 'disable')
            : this._portalService.logAction('function-list', 'enable');

        const observable = (this.runtimeVersion === 'V2')
            ? this._functionAppService.updateDisabledAppSettings(this.context, [item.functionInfo])
            : this._functionAppService.updateFunction(this.context, item.functionInfo);

        return observable
            .do(null, e => {
                item.functionInfo.config.disabled = !item.functionInfo.config.disabled;
                const state = item.functionInfo.config.disabled ? this._translateService.instant(PortalResources.enable) : this._translateService.instant(PortalResources.disable);
                this.showComponentError({
                    message: this._translateService.instant(PortalResources.failedToSwitchFunctionState, { state: state, functionName: item.functionInfo.name }),
                    errorId: errorIds.failedToSwitchEnabledFunction,
                    resourceId: this.context.site.id
                });
                this._globalStateService.clearBusyState();
                console.error(e);
            })
            .subscribe(() => {
                this.clearComponentErrors();
                this._globalStateService.clearBusyState();
            });
    }

    clickDelete(item: FunctionNode) {
        const functionInfo = item.functionInfo;
        const result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: functionInfo.name }));
        if (result) {
            this._globalStateService.setBusyState();
            this._portalService.logAction('function-list', 'delete');
            this._functionAppService.deleteFunction(this.context, functionInfo)
                .do(null, e => {
                    this._globalStateService.clearBusyState();
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
                    const scmHostName = this.context.site.properties.hostNameSslStates.find(s => s.hostType === 1).name;

                    item.sideNav.cacheService.clearCachePrefix(`https://${defaultHostName}`);
                    item.sideNav.cacheService.clearCachePrefix(`https://${scmHostName}`);

                    this._globalStateService.clearBusyState();
                });
        }
    }

    searchChanged(value: string) {
        this.functions = (<FunctionNode[]>this._functionsNode.children).filter(c => {
            return c.functionInfo.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
        });
    }

    searchCleared() {
        this.functions = (<FunctionNode[]>this._functionsNode.children);
    }

    onNewFunctionClick() {
        this._functionsNode.openCreateDashboard(DashboardType.CreateFunctionDashboard);
    }
}
