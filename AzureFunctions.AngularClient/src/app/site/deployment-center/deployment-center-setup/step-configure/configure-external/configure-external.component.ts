import { Component } from '@angular/core';
import { SelectOption } from 'app/shared/models/select-option';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { Validators } from '@angular/forms';

@Component({
    selector: 'app-configure-external',
    templateUrl: './configure-external.component.html',
    styleUrls: ['./configure-external.component.scss', '../step-configure.component.scss', '../../deployment-center-setup.component.scss']
})
export class ConfigureExternalComponent {
    public RepoTypeOptions: SelectOption<string>[] = [
        {
            displayLabel: 'Mercurial',
            value: 'Mercurial'
        },
        {
            displayLabel: 'Git',
            value: 'Git'
        }
    ];
    public repoMode = 'Git';
    constructor(public wizard: DeploymentCenterStateManager) {
        this.updateFormValidation();
    }

    repoTypeChanged(evt) {
        this.repoMode = evt;
        this.wizard.wizardForm.controls.sourceSettings.value.isMercurial = evt === 'Mercurial';
        console.log(evt);
    }
    updateFormValidation() {
        this.wizard.sourceSettings.get('repoUrl').setValidators(Validators.required);
        this.wizard.sourceSettings.get('branch').setValidators(Validators.required);
        this.wizard.sourceSettings.get('isMercurial').setValidators(Validators.required);
        this.wizard.sourceSettings.get('repoUrl').updateValueAndValidity();
        this.wizard.sourceSettings.get('branch').updateValueAndValidity();
        this.wizard.sourceSettings.get('isMercurial').updateValueAndValidity();
    }
}
