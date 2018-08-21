import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';

@Component({
    selector: 'step-deploy-function',
    templateUrl: './step-deploy-function.component.html',
    styleUrls: ['./step-deploy-function.component.scss', '../quickstart.component.scss']
})
export class StepDeployFunctionComponent {

    constructor(
        public _wizardService: QuickstartStateManager,
    ) {
    }

    deploy() {
        console.log("Deploy the function");
    }

}
