import {Component, Input} from '@angular/core';
import {Subject} from 'rxjs/Rx';
import {FunctionsService} from '../shared/services/functions.service';
import {FunctionInfo} from '../shared/models/function-info';
import {FunctionConfig} from '../shared/models/function-config';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {SelectOption} from '../shared/models/select-option';
import {PortalService} from '../shared/services/portal.service';
import {GlobalStateService} from '../shared/services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';

@Component({
  selector: 'function-manage',
  templateUrl: './function-manage.component.html',
  styleUrls: ['./function-manage.component.css']
})
export class FunctionManageComponent {
    @Input() selectedFunction: FunctionInfo;
    public functionStatusOptions: SelectOption<boolean>[];
    public disabled: boolean;
    private valueChange: Subject<boolean>;

    constructor(private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) {
        this.disabled = _broadcastService.getDirtyState("function_disabled");
        this.functionStatusOptions = [
            {
                displayLabel: this._translateService.instant(PortalResources.enabled),
                value: false
            }, {
                displayLabel: this._translateService.instant(PortalResources.disabled),
                value: true
            }];
        this.valueChange = new Subject<boolean>();
        this.valueChange
            .switchMap<FunctionInfo>((state, index) => {
                this.selectedFunction.config.disabled = state;
                return this._functionsService.updateFunction(this.selectedFunction);
            })
            .subscribe(fi => this.selectedFunction.config.disabled = fi.config.disabled);
    }

    deleteFunction() {
        var result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: this.selectedFunction.name }));
        if (result) {
            this._globalStateService.setBusyState();
            this._portalService.logAction("edit-component", "delete");
            this._functionsService.deleteFunction(this.selectedFunction)
                .subscribe(r => {
                    this._broadcastService.broadcast(BroadcastEvent.FunctionDeleted, this.selectedFunction);
                    this._globalStateService.clearBusyState();
                });
        }
    }
}