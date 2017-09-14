import { Component } from '@angular/core';
import { ProviderCard } from 'app/site/deployment-center/deployment-center-setup/step-source-control/step-source-control.component';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';

@Component({
    selector: 'app-step-build-provider',
    templateUrl: './step-build-provider.component.html',
    styleUrls: ['./step-build-provider.component.scss']
})
export class StepBuildProviderComponent {
    public readonly providerCards: ProviderCard[] = [
        {
            id: 'vsts',
            name: 'VSTS',
            icon: 'images/deployment-center/onedrive-logo.svg',
            color: '#68227A',
            barColor: '#CED2EA',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
            authorizedStatus: 'none'
        },
        {
            id: 'kudu',
            name: 'Kudu',
            icon: 'images/deployment-center/onedrive-logo.svg',
            color: '#000000',
            barColor: '#D6D6D6',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
            authorizedStatus: 'none'
        }
    ];

    public selectedProvider: ProviderCard = null;
    
    constructor(public wizard: DeploymentCenterWizardService) {}

    chooseBuildProvider(card : ProviderCard){
      this.wizard.changeBuildProvider(card.id);
    }
}
