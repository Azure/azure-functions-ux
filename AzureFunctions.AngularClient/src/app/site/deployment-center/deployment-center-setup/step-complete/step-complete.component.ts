import { Component, OnInit } from '@angular/core';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';
import { KuduBuildSettings } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-setup-models';

@Component({
    selector: 'app-step-complete',
    templateUrl: './step-complete.component.html',
    styleUrls: ['./step-complete.component.scss']
})
export class StepCompleteComponent implements OnInit {
    constructor(private _wizard: DeploymentCenterWizardService) {}

    get repo() {
        const buildSettings: KuduBuildSettings = this._wizard.currentWizardState.buildSettings as KuduBuildSettings;
        if (buildSettings) {
            return buildSettings.repoUrl;
        }
        return 'no onedrive';
    }
    ngOnInit() {}
}
