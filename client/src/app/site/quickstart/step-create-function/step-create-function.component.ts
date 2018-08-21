import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';

@Component({
    selector: 'step-create-function',
    templateUrl: './step-create-function.component.html',
    styleUrls: ['./step-create-function.component.scss', '../quickstart.component.scss']
})
export class StepCreateFunctionComponent {

    constructor(
        public _wizardService: QuickstartStateManager,
    ) {
    }

    get createPortalFunction(): boolean {
        const devEnvironment =
        this._wizardService &&
        this._wizardService.wizardForm &&
        this._wizardService.wizardForm.controls &&
        this._wizardService.wizardForm.controls['devEnvironment'] &&
        this._wizardService.wizardForm.controls['devEnvironment'].value;
        return devEnvironment === 'portal';
    }

    create() {
        console.log("I created a portal function");
    }


}
