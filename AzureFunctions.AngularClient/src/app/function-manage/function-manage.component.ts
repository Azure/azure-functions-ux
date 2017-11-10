import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { TreeUpdateEvent } from './../shared/models/broadcast-event';
import { BroadcastService } from './../shared/services/broadcast.service';
import { ConfigService } from './../shared/services/config.service';
import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/zip';
import { TranslateService } from '@ngx-translate/core';

import { FunctionInfo } from '../shared/models/function-info';
import { SelectOption } from '../shared/models/select-option';
import { PortalService } from '../shared/services/portal.service';
import { GlobalStateService } from '../shared/services/global-state.service';
import { PortalResources } from '../shared/models/portal-resources';
import { FunctionApp } from '../shared/function-app';
import { BindingManager } from '../shared/models/binding-manager';

@Component({
    selector: 'function-manage',
    templateUrl: './function-manage.component.html',
    styleUrls: ['./function-manage.component.css']
})
export class FunctionManageComponent {
    public functionStatusOptions: SelectOption<boolean>[];
    public functionInfo: FunctionInfo;
    public functionApp: FunctionApp;
    public isStandalone: boolean;
    public isHttpFunction = false;

    private functionStateValueChange: Subject<boolean>;

    constructor(private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _broadcastService: BroadcastService,
        configService: ConfigService) {

        this.isStandalone = configService.isStandalone();

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
                return this.functionApp.updateFunction(this.functionInfo).catch(() => { throw originalState; });
            })
            .do(null, originalState => {
                this.functionInfo.config.disabled = originalState;
                this._globalStateService.clearBusyState();
            })
            .retry()
            .subscribe((fi: FunctionInfo) => {
                this._globalStateService.clearBusyState();
                this.functionInfo.config.disabled = fi.config.disabled;
                this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
                    resourceId: `${this.functionApp.site.id}/functions/${this.functionInfo.name}`,
                    operation: 'update',
                    data: fi.config.disabled
                });
            });
    }

    @Input() set selectedFunction(functionInfo: FunctionInfo) {
        this.functionInfo = functionInfo;
        this.functionApp = this.functionInfo.functionApp;
        this.isHttpFunction = BindingManager.isHttpFunction(this.functionInfo);
    }

    deleteFunction() {
        const result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: this.functionInfo.name }));
        if (result) {
            this._globalStateService.setBusyState();
            this._portalService.logAction('edit-component', 'delete');
            // Clone node for removing as it can be change during http call
            this.functionApp.deleteFunction(this.functionInfo)
                .subscribe(() => {

                    this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
                        resourceId: `${this.functionInfo.context.site.id}/functions/${this.functionInfo.name}`,
                        operation: 'remove'
                    });
                    // this._broadcastService.broadcast(BroadcastEvent.FunctionDeleted, this.functionInfo);
                    this._globalStateService.clearBusyState();
                });
        }
    }
}
