import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';

@Component({
    selector: 'step-choose-deployment-method',
    templateUrl: './step-choose-deployment-method.component.html',
    styleUrls: ['./step-choose-deployment-method.component.scss', '../quickstart.component.scss']
})
export class StepChooseDeploymentMethodComponent {

    constructor(
        public _wizardService: QuickstartStateManager,
    ) {
    }


}
