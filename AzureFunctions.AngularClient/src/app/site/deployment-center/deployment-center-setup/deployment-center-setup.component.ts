import { Component, Input, SimpleChanges } from '@angular/core';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';

@Component({
    selector: 'app-deployment-center-setup',
    templateUrl: './deployment-center-setup.component.html',
    styleUrls: ['./deployment-center-setup.component.scss'],
    providers: [DeploymentCenterWizardService]
})
export class DeploymentCenterSetupComponent {
    @Input() resourceId: string;
    constructor(private _wizardService: DeploymentCenterWizardService) {}

    get showTestStep() {
        const buildProvider = this._wizardService.currentWizardState.buildProvider;
        return buildProvider === 'vsts';
    }

    get showDeployStep() {
        const buildProvider = this._wizardService.currentWizardState.buildProvider;
        return buildProvider === 'vsts';
    }

    get showBuildStep() {
        const sourceControlProvider = this._wizardService.currentWizardState.sourceProvider;
        return  sourceControlProvider !== 'onedrive' && sourceControlProvider !== 'dropbox' && sourceControlProvider !== 'bitbucket' && sourceControlProvider !== 'ftp'  && sourceControlProvider !== 'webdeploy'
    }

    get showConfigureStep() {
        const sourceControlProvider = this._wizardService.currentWizardState.sourceProvider;
        return sourceControlProvider !== 'ftp'  && sourceControlProvider !== 'webdeploy'
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['resourceId']) {
            this._wizardService.resourceIdStream.next(this.resourceId);
        }
    }
}
