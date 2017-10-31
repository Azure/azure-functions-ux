import { Component } from '@angular/core';
import { SelectOption } from 'app/shared/models/select-option';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';

@Component({
    selector: 'app-configure-external',
    templateUrl: './configure-external.component.html',
    styleUrls: ['./configure-external.component.scss', '../step-configure.component.scss']
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
    constructor(
        private _wizard: DeploymentCenterWizardService
    ) {
    }


    repoTypeChanged(evt) { 
      this.repoMode = evt;
      this._wizard.wizardForm.controls.sourceSettings.value.isMercurial = evt === 'Mercurial';
      console.log(evt);
    }
}
