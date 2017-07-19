import { ErrorIds } from './../shared/models/error-ids';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BroadcastService } from './../shared/services/broadcast.service';
import { AppNode } from './../tree-view/app-node';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { FunctionNode } from './../tree-view/function-node';
import { FunctionInfo } from './../shared/models/function-info';
import { FunctionsNode } from './../tree-view/functions-node';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';
import { FunctionApp } from '../shared/function-app';
import { GlobalStateService } from '../shared/services/global-state.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../shared/models/portal-resources';
import { PortalService } from '../shared/services/portal.service';
import { FunctionManageNode } from '../tree-view/function-node';
import { DashboardType } from '../tree-view/models/dashboard-type';
import { ErrorType, ErrorEvent } from "app/shared/models/error-event";

@Component({
    selector: 'functions-list',
    templateUrl: './functions-list.component.html',
    styleUrls: ['./functions-list.component.scss']
})
export class FunctionsListComponent implements OnInit, OnDestroy {
    public viewInfoStream: Subject<TreeViewInfo<any>>;
    public functions: FunctionNode[] = [];
    public isLoading: boolean;
    public functionApp: FunctionApp;
    public appNode: AppNode;

    private _viewInfoSubscription: RxSubscription;

    private _functionsNode: FunctionsNode;

    constructor(private _globalStateService: GlobalStateService,
        private _portalService: PortalService,
        private _translateService: TranslateService,
        private _broadcastService: BroadcastService
    ) {
        this.viewInfoStream = new Subject<TreeViewInfo<any>>();

        this._viewInfoSubscription = this.viewInfoStream
            .distinctUntilChanged()
            .switchMap(viewInfo => {
                this.isLoading = true;
                this._functionsNode = (<FunctionsNode>viewInfo.node);
                this.appNode = (<AppNode>viewInfo.node.parent)
                this.functionApp = this._functionsNode.functionApp;
                return this._functionsNode.loadChildren();
            })
            .subscribe(() => {
                this.isLoading = false;
                this.functions = (<FunctionNode[]>this._functionsNode.children);
            });
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this._viewInfoSubscription.unsubscribe();
    }

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<any>) {
        this.viewInfoStream.next(viewInfo);
    }

    clickRow(item: FunctionNode) {
        item.select();
    }

    enableChange(item: FunctionNode) {
        item.functionInfo.config.disabled = !item.functionInfo.config.disabled;
        return this.functionApp.updateFunction(item.functionInfo)
            .do(null, e => {
                item.functionInfo.config.disabled = !item.functionInfo.config.disabled;
                let state = item.functionInfo.config.disabled ? this._translateService.instant(PortalResources.enable) : this._translateService.instant(PortalResources.disable);
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: this._translateService.instant(PortalResources.failedToSwitchFunctionState, { state: state, functionName: item.functionInfo.name }),
                    errorId: ErrorIds.failedToSwitchEnabledFunction,
                    errorType: ErrorType.UserError,
                    resourceId: this.functionApp.site.id
                });
                console.error(e);
            })
            .subscribe(r => {
                this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.failedToSwitchEnabledFunction);
            });
    }

    clickDelete(item: FunctionNode) {
        const functionInfo = item.functionInfo;
        const result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: functionInfo.name }));
        if (result) {
            this._globalStateService.setBusyState();
            this._portalService.logAction("edit-component", "delete");
            this.functionApp.deleteFunction(functionInfo)
                .do(null, e => {
                    this._globalStateService.clearBusyState();
                    console.error(e);
                })
                .subscribe(r => {
                    var indexToDelete = this.functions.indexOf(item);
                    if (indexToDelete > -1) {
                        this.functions.splice(indexToDelete, 1);
                    }

                    this._functionsNode.removeChild(item.functionInfo, false);

                    let defaultHostName = this._functionsNode.functionApp.site.properties.defaultHostName;
                    let scmHostName = this._functionsNode.functionApp.site.properties.hostNameSslStates.find(s => s.hostType === 1).name;

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
        this._functionsNode.openCreateDashboard(DashboardType.createFunction);
    }
}
