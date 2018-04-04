import { Component } from '@angular/core';
import { SelectOption } from 'app/shared/models/select-option';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { RequiredValidator } from '../../../../../shared/validators/requiredValidator';
import { TranslateService } from '@ngx-translate/core';

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
    constructor(public wizard: DeploymentCenterStateManager,
                private _translateService: TranslateService) {
        this.updateFormValidation();
    }

    repoTypeChanged(evt) {
        this.repoMode = evt;
        this.wizard.wizardForm.controls.sourceSettings.value.isMercurial = evt === 'Mercurial';
        console.log(evt);
    }
    updateFormValidation() {
        const required = new RequiredValidator(this._translateService, false);
        this.wizard.sourceSettings.get('repoUrl').setValidators(required.validate.bind(required));
        this.wizard.sourceSettings.get('branch').setValidators(required.validate.bind(required));
        this.wizard.sourceSettings.get('isMercurial').setValidators(required.validate.bind(required));
        this.wizard.sourceSettings.get('repoUrl').updateValueAndValidity();
        this.wizard.sourceSettings.get('branch').updateValueAndValidity();
        this.wizard.sourceSettings.get('isMercurial').updateValueAndValidity();
    }
}
