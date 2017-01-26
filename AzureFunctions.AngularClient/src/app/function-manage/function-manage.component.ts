import {Component, Input} from '@angular/core';
import {Subject} from 'rxjs/Rx';
import {FunctionInfo} from '../shared/models/function-info';
import {FunctionConfig} from '../shared/models/function-config';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {SelectOption} from '../shared/models/select-option';
import {PortalService} from '../shared/services/portal.service';
import {GlobalStateService} from '../shared/services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';
import {FunctionApp} from '../shared/function-app';

@Component({
    selector: 'function-manage',
    templateUrl: './function-manage.component.html',
    styleUrls: ['./function-manage.component.css'],
    inputs: ['selectedFunction']
})
export class FunctionManageComponent {
    public functionStatusOptions: SelectOption<boolean>[];
    public disabled: boolean;
    public functionInfo : FunctionInfo;
    public functionApp : FunctionApp;
    private _functionStream : Subject<FunctionInfo>;

    constructor(private _broadcastService: BroadcastService,
                private _portalService: PortalService,
                private _globalStateService: GlobalStateService,
                private _translateService: TranslateService) {

        this._functionStream = new Subject<FunctionInfo>();
        this._functionStream
            .distinctUntilChanged()
            .subscribe(fi =>{
                this.functionInfo = fi;
                this.functionApp = fi.functionApp;
            });

        this.disabled = _broadcastService.getDirtyState("function_disabled");
        this.functionStatusOptions = [
            {
                displayLabel: this._translateService.instant(PortalResources.enabled),
                value: false
            }, {
                displayLabel: this._translateService.instant(PortalResources.disabled),
                value: true
            }];
    }

    set selectedFunction(functionInfo : FunctionInfo){
        this._functionStream.next(functionInfo);
    }

    deleteFunction() {
        var result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: this.functionInfo.name }));
        if (result) {
            this._globalStateService.setBusyState();
            this._portalService.logAction("edit-component", "delete");
            this.functionApp.deleteFunction(this.functionInfo)
                .subscribe(r => {
                    this._broadcastService.broadcast(BroadcastEvent.FunctionDeleted, this.functionInfo);
                    this._globalStateService.clearBusyState();
                });
        }
    }
}