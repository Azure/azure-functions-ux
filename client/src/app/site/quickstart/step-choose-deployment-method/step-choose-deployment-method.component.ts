import { QuickstartService } from './../../../shared/services/quickstart.service';
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

    public readonly deploymentCenterCard: DeploymentCard = {
        id: 'deploymentCenter',
        name: this._translateService.instant(PortalResources.deploymentCenterCardTitle),
        icon: 'image/deployment-center/vsts.svg',
        color: '#0078D4',
        description: this._translateService.instant(PortalResources.deploymentCenterCardDescription)
    };

    public readonly vsDirectPublishCard: DeploymentCard = {
        id: 'vsDirectPublish',
        name: this._translateService.instant(PortalResources.directPublishCardTitle),
        icon: 'image/publish.svg',
        color: '#000000',
        description: this._translateService.instant(PortalResources.vsDirectPublishCardDescription)
    };

    public readonly vscodeDirectPublishCard: DeploymentCard = {
        id: 'vscodeDirectPublish',
        name: this._translateService.instant(PortalResources.directPublishCardTitle),
        icon: 'image/publish.svg',
        color: '#000000',
        description: this._translateService.instant(PortalResources.vscodeDirectPublishCardDescription)
    };

    public readonly coretoolsDirectPublishCard: DeploymentCard = {
        id: 'coretoolsDirectPublish',
        name: this._translateService.instant(PortalResources.directPublishCardTitle),
        icon: 'image/publish.svg',
        color: '#000000',
        description: this._translateService.instant(PortalResources.coretoolsDirectPublishCardDescription)
    };

    public readonly mavenDirectPublishCard: DeploymentCard = {
        id: 'mavenDirectPublish',
        name: this._translateService.instant(PortalResources.directPublishCardTitle),
        icon: 'image/publish.svg',
        color: '#000000',
        description: this._translateService.instant(PortalResources.mavenDirectPublishCardDescription)
    };

    public selectedDeploymentCard: DeploymentCard = null;

    constructor(
        private _wizardService: QuickstartStateManager,
        private _translateService: TranslateService,
        private _quickstartService: QuickstartService
    ) {
    }

    public selectDeployment(card: DeploymentCard) {
        this.selectedDeploymentCard = card;
        const currentFormValues = this._wizardService.wizardValues;
        currentFormValues.deployment = card.id;
        this._wizardService.wizardValues = currentFormValues;
    }

    get deployment(): string {
        return this._wizardService.deployment.value;
    }

    get devEnvironment(): string {
        return this._wizardService.devEnvironment.value;
    }

    get markdownFileName(): string {
        switch (this.deployment) {
            case 'deploymentCenter':
                switch (this.devEnvironment) {
                    case 'vs':
                        return 'vsDeploymentCenter';

                    case 'vscode':
                        return 'vscodeDeploymentCenter';

                    case 'coretools':
                        return 'coretoolsDeploymentCenter';

                    case 'maven':
                        return 'mavenDeploymentCenter';

                    default:
                        return null;
                }

            case 'vsDirectPublish':
                return 'vsDirectPublish';

            case 'vscodeDirectPublish':
                return 'vscodeDirectPublish';

            case 'coretoolsDirectPublish':
                return 'coretoolsDirectPublish';

            case 'mavenDirectPublish':
                return 'mavenDirectPublish';

            default:
                return null;
        }
    }

    public getInstructions() {
        this._quickstartService.getQuickstartFile(this.markdownFileName)
            .subscribe(file => {
                console.log(file);
                const currentFormValues = this._wizardService.wizardValues;
                currentFormValues.instructions = file;
                this._wizardService.wizardValues = currentFormValues;
            });
    }

    get deploymentCards(): DeploymentCard[] {
        const devEnvironment = this._wizardService.devEnvironment.value;

        switch (devEnvironment) {
            case 'vs':
                return [this.vsDirectPublishCard, this.deploymentCenterCard];
            case 'vscode':
                return [this.vscodeDirectPublishCard, this.deploymentCenterCard];
            case 'coretools':
                return [this.coretoolsDirectPublishCard, this.deploymentCenterCard];
            case 'maven':
                return [this.mavenDirectPublishCard, this.deploymentCenterCard];
            default:
                return [];
        }
    }
}
