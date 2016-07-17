import {Component} from '@angular/core';
import {Subject} from 'rxjs/Rx';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {FunctionConfig} from '../models/function-config';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {SelectOption} from '../models/select-option';
import {RadioSelectorComponent} from './radio-selector.component';
import {PortalService} from '../services/portal.service';
import {GlobalStateService} from '../services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';

@Component({
    selector: 'function-manage',
    templateUrl: 'templates/function-manage.component.html',
    styleUrls: ['styles/function-manage.style.css'],
    inputs: ['selectedFunction'],
    directives: [RadioSelectorComponent],
    pipes: [TranslatePipe]
})
export class FunctionManageComponent {
    public selectedFunction: FunctionInfo;
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
            .distinctUntilChanged()
            .debounceTime(500)
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