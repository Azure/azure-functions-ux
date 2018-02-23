import { Component } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';

@Component({
    selector: 'app-step-configure',
    templateUrl: './step-configure.component.html',
    styleUrls: ['./step-configure.component.scss', '../deployment-center-setup.component.scss']
})
export class StepConfigureComponent {
    constructor(public wizard: DeploymentCenterStateManager) {}

    get sourceProvider() {
        return (
            this.wizard.wizardForm &&
            this.wizard.wizardForm.controls.sourceProvider &&
            this.wizard.wizardForm.controls.sourceProvider.value
        );
    }

    get buildProvider() {
        return (
            this.wizard.wizardForm &&
            this.wizard.wizardForm.controls.buildProvider &&
            this.wizard.wizardForm.controls.buildProvider.value
        );
    }
}
