import { devEnvironmentOptions } from 'app/site/quickstart/wizard-logic/quickstart-models';
import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';

@Component({
    selector: 'step-create-function',
    templateUrl: './step-create-function.component.html',
    styleUrls: ['./step-create-function.component.scss', '../quickstart.component.scss'],
})
export class StepCreateFunctionComponent  {

    public devEnvironment: devEnvironmentOptions;
    public showPortalFunctions: boolean;

    constructor(private _wizardService: QuickstartStateManager) {

        this._wizardService.devEnvironment.statusChanges.subscribe(() => {
            this.devEnvironment = this._wizardService.devEnvironment.value;
            this.showPortalFunctions = this.devEnvironment === 'portal';
        });
    }
}
