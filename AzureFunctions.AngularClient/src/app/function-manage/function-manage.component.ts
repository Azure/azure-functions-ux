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
import { ErrorIds } from './../shared/models/error-ids';
import { ErrorType, ErrorEvent } from 'app/shared/models/error-event';

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
    public runtimeVersion: string;

    private functionStream: Subject<FunctionApp>;
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
                this.functionInfo.config.disabled = state;
                this._globalStateService.setBusyState();
                this.functionInfo.config.disabled
                    ? this._portalService.logAction('function-manage', 'disable')
                    : this._portalService.logAction('function-manage', 'enable');
                return (this.runtimeVersion === 'V2') ? this.functionApp.updateDisabledAppSettings([this.functionInfo])
                    : this.functionApp.updateFunction(this.functionInfo);
            })
            .do(null, (e) => {
                this.functionInfo.config.disabled = !this.functionInfo.config.disabled;
                this._globalStateService.clearBusyState();
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: this._translateService.instant(PortalResources.failedToSwitchFunctionState, 
                        { state: !this.functionInfo.config.disabled, functionName: this.functionInfo.name }),
                    errorId: ErrorIds.failedToSwitchEnabledFunction,
                    errorType: ErrorType.UserError,
                    resourceId: this.functionApp.site.id
                });
                console.error(e);
            })
            .retry()
            .subscribe(() => {
                this._globalStateService.clearBusyState();
                this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
                    resourceId: `${this.functionApp.site.id}/functions/${this.functionInfo.name}`,
                    operation: 'update',
                    data: this.functionInfo.config.disabled
                });
            });

        this.functionStream = new Subject<FunctionApp>(); 
        this.functionStream
            .switchMap(functionApp => {
                // Getting function runtime version
                return functionApp.getRuntimeGeneration();
            })
            .do(null, (e) => {
                console.error(e);
            })
            .subscribe(runtimeVersion => {
                this.runtimeVersion = runtimeVersion;
            });
    }

    @Input() set selectedFunction(functionInfo: FunctionInfo) {
        this.functionInfo = functionInfo;
        this.functionApp = this.functionInfo.functionApp;
        this.isHttpFunction = BindingManager.isHttpFunction(this.functionInfo);

        this.functionStream.next(this.functionApp);
    }

    deleteFunction() {
        const result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: this.functionInfo.name }));
        if (result) {
            this._globalStateService.setBusyState();
            this._portalService.logAction('function-manage', 'delete');
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
