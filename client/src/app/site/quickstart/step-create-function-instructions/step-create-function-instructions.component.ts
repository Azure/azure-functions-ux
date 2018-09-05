import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { SiteTabIds } from 'app/shared/models/constants';

@Component({
    selector: 'step-create-function-instructions',
    templateUrl: './step-create-function-instructions.component.html',
    styleUrls: ['./step-create-function-instructions.component.scss', '../quickstart.component.scss'],
})
export class StepCreateFunctionInstructionsComponent {

    public instructions: string;

    constructor(
        private _wizardService: QuickstartStateManager,
        private _broadcastService: BroadcastService) {

        this.instructions = this._wizardService.instructions.value;

        this._wizardService.instructions.statusChanges.subscribe(() => {
            this.instructions = this._wizardService.instructions.value;
        });
    }

    public closeTab() {
        this._broadcastService.broadcastEvent(BroadcastEvent.CloseTab, SiteTabIds.quickstart);
    }
}
