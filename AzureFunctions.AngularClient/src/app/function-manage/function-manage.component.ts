import { ConfigService } from './../shared/services/config.service';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/zip';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

import { FunctionInfo } from '../shared/models/function-info';
import { FunctionConfig } from '../shared/models/function-config';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event'
import { SelectOption } from '../shared/models/select-option';
import { PortalService } from '../shared/services/portal.service';
import { GlobalStateService } from '../shared/services/global-state.service';
import { PortalResources } from '../shared/models/portal-resources';
import { FunctionApp } from '../shared/function-app';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { FunctionManageNode } from '../tree-view/function-node';
import { BindingManager } from '../shared/models/binding-manager';

@Component({
    selector: 'function-manage',
    templateUrl: './function-manage.component.html',
    styleUrls: ['./function-manage.component.css'],
    inputs: ['viewInfoInput']
})
export class FunctionManageComponent {
    public functionStatusOptions: SelectOption<boolean>[];
    public functionInfo: FunctionInfo;
    public functionApp: FunctionApp;
    public isStandalone: boolean;
    public isHttpFunction: boolean = false;

    private _viewInfoStream: Subject<TreeViewInfo<any>>;
    private _functionNode: FunctionManageNode;
    private functionStateValueChange: Subject<boolean>;

    constructor(private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        configService: ConfigService) {

        this.isStandalone = configService.isStandalone();

        this._viewInfoStream = new Subject<TreeViewInfo<any>>();
        this._viewInfoStream
            .retry()
            .subscribe(viewInfo => {
                this._functionNode = <FunctionManageNode>viewInfo.node;
                this.functionInfo = this._functionNode.functionInfo;
                this.functionApp = this.functionInfo.functionApp;
                this.isHttpFunction = BindingManager.isHttpFunction(this.functionInfo);
            });

        this.functionStatusOptions = [
            {
                displayLabel: this._translateService.instant(PortalResources.enabled),
                value: false
            }, {
                displayLabel: this._translateService.instant(PortalResources.disabled),
                value: true
            }];

        this.functionStateValueChange = new Subject<boolean>();
        this.functionStateValueChange
            .switchMap(state => {
                const originalState = this.functionInfo.config.disabled;
                this._globalStateService.setBusyState();
                this.functionInfo.config.disabled = state;
                return this.functionApp.updateFunction(this.functionInfo).catch(e => { throw originalState; });
            })
            .do(null, originalState => {
                this.functionInfo.config.disabled = originalState;
                this._globalStateService.clearBusyState();
            })
            .retry()
            .subscribe((fi: FunctionInfo) => {
                this._globalStateService.clearBusyState();
                this.functionInfo.config.disabled = fi.config.disabled;
            });
    }

    set viewInfoInput(viewInfo: TreeViewInfo<any>) {
        this._viewInfoStream.next(viewInfo);
    }

    deleteFunction() {
        var result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: this.functionInfo.name }));
        if (result) {
            this._globalStateService.setBusyState();
            this._portalService.logAction("edit-component", "delete");
            // Clone node for removing as it can be change during http call
            var clone = Object.create(this._functionNode);
            this.functionApp.deleteFunction(this.functionInfo)
                .subscribe(r => {
                    clone.remove();
                    // this._broadcastService.broadcast(BroadcastEvent.FunctionDeleted, this.functionInfo);
                    this._globalStateService.clearBusyState();
                });
        }
    }
}
