import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';

@Component({
    selector: 'step-create-function-instructions',
    templateUrl: './step-create-function-instructions.component.html',
    styleUrls: ['./step-create-function-instructions.component.scss', '../quickstart.component.scss'],
})
export class StepCreateFunctionInstructionsComponent {

    public instructions: string;

    constructor(
        private _wizardService: QuickstartStateManager) {

        this.instructions = this._wizardService.instructions.value;

        this._wizardService.instructions.statusChanges.subscribe(() => {
            this.instructions = this._wizardService.instructions.value;
        });
    }
}
