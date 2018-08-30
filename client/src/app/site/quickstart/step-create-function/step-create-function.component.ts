import { devEnvironmentOptions } from 'app/site/quickstart/wizard-logic/quickstart-models';
import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';

@Component({
    selector: 'step-create-function',
    templateUrl: './step-create-function.component.html',
    styleUrls: ['./step-create-function.component.scss', '../quickstart.component.scss'],
})
export class StepCreateFunctionComponent  {

    constructor(
        private _wizardService: QuickstartStateManager) {
    }

    get showPortalFunctions(): boolean {
        return this.devEnvironment === 'portal';
    }

    get devEnvironment(): devEnvironmentOptions {
        return this._wizardService.devEnvironment.value;
    }

    get haveInstructions(): boolean {
        return !!this._wizardService.instructions.value;
    }
}
