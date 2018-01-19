import { FunctionAppContext } from './../shared/function-app-context';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { TreeUpdateEvent } from './../shared/models/broadcast-event';
import { BroadcastService } from './../shared/services/broadcast.service';
import { ConfigService } from './../shared/services/config.service';
import { Component } from '@angular/core';
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
import { BindingManager } from '../shared/models/binding-manager';
import { errorIds } from './../shared/models/error-ids';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { NavigableComponent } from '../shared/components/navigable-component';
import { DashboardType } from '../tree-view/models/dashboard-type';

@Component({
    selector: 'function-manage',
    templateUrl: './function-manage.component.html',
    styleUrls: ['./function-manage.component.css']
})
export class FunctionManageComponent extends NavigableComponent {
    public functionStatusOptions: SelectOption<boolean>[];
    public functionInfo: FunctionInfo;
    public isStandalone: boolean;
    public isHttpFunction = false;
    public runtimeVersion: string;
    public functionStateValueChange: Subject<boolean>;
    public context: FunctionAppContext;

    constructor(private _portalService: PortalService,
        private _functionAppService: FunctionAppService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        broadcastService: BroadcastService,
        configService: ConfigService) {

        super('function-manage', broadcastService, DashboardType.FunctionManageDashboard);

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
                this.functionInfo.config.disabled
                    ? this._portalService.logAction('function-manage', 'disable')
                    : this._portalService.logAction('function-manage', 'enable');
                return (this.runtimeVersion === 'V2')
                    ? this._functionAppService.updateDisabledAppSettings(this.context, [this.functionInfo])
                    : this._functionAppService.updateFunction(this.context, this.functionInfo);
            })
            .do(null, (e) => {
                this.functionInfo.config.disabled = !this.functionInfo.config.disabled;
                this._globalStateService.clearBusyState();
                this.showComponentError({
                    message: this._translateService.instant(PortalResources.failedToSwitchFunctionState,
                        { state: !this.functionInfo.config.disabled, functionName: this.functionInfo.name }),
                    errorId: errorIds.failedToSwitchEnabledFunction,
                    resourceId: this.context.site.id
                });
                console.error(e);
            })
            .retry()
            .takeUntil(this.ngUnsubscribe)
            .subscribe(() => {
                this._globalStateService.clearBusyState();
                this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
                    resourceId: `${this.context.site.id}/functions/${this.functionInfo.name}`,
                    operation: 'update',
                    data: this.functionInfo.config.disabled
                });
            }, null, () => this._globalStateService.clearBusyState());
    }

    setupNavigation(): Subscription {
        return this.navigationEvents
            .do(() => this._globalStateService.setBusyState())
            .switchMap(view => Observable.zip(
                this._functionAppService.getAppContext(view.siteDescriptor.getTrimmedResourceId()),
                Observable.of(view)
            ))
            .switchMap(tuple => Observable.zip(
                this._functionAppService.getRuntimeGeneration(tuple[0]),
                this._functionAppService.getFunction(tuple[0], tuple[1].functionDescriptor.name),
                Observable.of(tuple[0]),
                Observable.of(tuple[1])
            ))
            .do(() => this._globalStateService.clearBusyState())
            .subscribe(tuple => {
                this.context = tuple[2];
                this.functionInfo = tuple[1].result;
                this.runtimeVersion = tuple[0];
                this.isHttpFunction = BindingManager.isHttpFunction(this.functionInfo);
            });
    }

    deleteFunction() {
        const result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: this.functionInfo.name }));
        if (result) {
            this._globalStateService.setBusyState();
            this._portalService.logAction('function-manage', 'delete');
            // Clone node for removing as it can be change during http call
            this._functionAppService.deleteFunction(this.context, this.functionInfo)
                .subscribe(() => {
                    this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
                        resourceId: `${this.context.site.id}/functions/${this.functionInfo.name}`,
                        operation: 'remove'
                    });
                    // this._broadcastService.broadcast(BroadcastEvent.FunctionDeleted, this.functionInfo);
                    this._globalStateService.clearBusyState();
                });
        }
    }
}
