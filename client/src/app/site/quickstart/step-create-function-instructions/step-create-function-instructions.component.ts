import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';

@Component({
    selector: 'step-create-function-instructions',
    templateUrl: './step-create-function-instructions.component.html',
    styleUrls: ['./step-create-function-instructions.component.scss', '../quickstart.component.scss'],
})
export class StepCreateFunctionInstructionsComponent {

    public markdownFile: string;
    constructor(
        private _wizardService: QuickstartStateManager) {
    }

    get instructions(): string {
        return this._wizardService.instructions.value;
    }
}
