import { Component } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';

@Component({
    selector: 'app-step-configure',
    templateUrl: './step-configure.component.html',
    styleUrls: ['./step-configure.component.scss', '../deployment-center-setup.component.scss']
})
export class StepConfigureComponent {
    constructor(public wizard: DeploymentCenterStateManager) { }

    get sourceProvider() {
        const values = this.wizard.wizardValues;
        return values && values.sourceProvider;
    }

    get buildProvider() {
        const values = this.wizard.wizardValues;
        return values && values.buildProvider;
    }

    get configureValid() {
        return this.wizard.buildSettings.valid && this.wizard.sourceSettings.valid;
    }
}
