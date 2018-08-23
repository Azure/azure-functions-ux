import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { DeploymentCard } from 'app/site/quickstart/Models/deployment-card';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';

@Component({
    selector: 'step-choose-deployment-method',
    templateUrl: './step-choose-deployment-method.component.html',
    styleUrls: ['./step-choose-deployment-method.component.scss', '../quickstart.component.scss']
})
export class StepChooseDeploymentMethodComponent {

    public readonly deploymentCards: DeploymentCard[] = [
        {
            id: 'directPublish',
            name: 'Direct Publish',
            icon: 'image/deployment-center/vsts.svg',
            color: '#2B79DA',
            description: this._translateService.instant(PortalResources.vstsDesc)
        },
        {
            id: 'deploymentCenter',
            name: 'Deployment Center',
            icon: 'image/deployment-center/vsts.svg',
            color: '#2B79DA',
            description: this._translateService.instant(PortalResources.vstsDesc)
        }
    ];

    public selectedDeploymentCard: DeploymentCard = null;

    constructor(
        public _wizardService: QuickstartStateManager,
        public _translateService: TranslateService
    ) {
    }

    public selectDeployment(card: DeploymentCard) {
        this.selectedDeploymentCard = card;
        const currentFormValues = this._wizardService.wizardValues;
        currentFormValues.deployment = card.id;
        this._wizardService.wizardValues = currentFormValues;
    }
}
