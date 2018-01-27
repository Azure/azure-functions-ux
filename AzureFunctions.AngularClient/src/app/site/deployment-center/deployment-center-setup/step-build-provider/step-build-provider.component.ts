import { Component } from '@angular/core';
import { ProviderCard } from 'app/site/deployment-center/deployment-center-setup/step-source-control/step-source-control.component';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';

@Component({
    selector: 'app-step-build-provider',
    templateUrl: './step-build-provider.component.html',
    styleUrls: ['./step-build-provider.component.scss']
})
export class StepBuildProviderComponent {
    public readonly providerCards: ProviderCard[] = [
        {
            id: 'vsts',
            name: 'VSTS build server',
            icon: 'image/deployment-center/onedrive-logo.svg',
            color: '#68227A',
            barColor: '#CED2EA',
            description:
                'Use VSTS as the build server. You can choose to leverage advanced options for a full release management workflow.',
            authorizedStatus: 'none'
        },
        {
            id: 'kudu',
            name: 'App Service Kudu build server',
            icon: 'image/deployment-center/onedrive-logo.svg',
            color: '#000000',
            barColor: '#D6D6D6',
            description:
                'Use App Service as the build server. The App Service Kudu engine will automatically build your code during deployment when applicable with no additional configuration required.',
            authorizedStatus: 'none'
        }
    ];

    public selectedProvider: ProviderCard = null;

    constructor(public wizard: DeploymentCenterStateManager) {}

    chooseBuildProvider(card: ProviderCard) {
        this.wizard.wizardForm.controls['buildProvider'].setValue(card.id, { onlySelf: true });
    }
}
