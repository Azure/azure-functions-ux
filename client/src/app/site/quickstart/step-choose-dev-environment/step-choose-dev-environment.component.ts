import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { TranslateService } from '@ngx-translate/core';
import { DevEnvironmentCard } from '../Models/dev-environment-card';
import { PortalResources } from '../../../shared/models/portal-resources';

@Component({
    selector: 'step-choose-dev-environment',
    templateUrl: './step-choose-dev-environment.component.html',
    styleUrls: ['./step-choose-dev-environment.component.scss', '../quickstart.component.scss']
})
export class StepChooseDevEnvironmentComponent {

    public readonly vsCard: DevEnvironmentCard =
    {
        id: 'vs',
        name: this._translateService.instant(PortalResources.vsCardTitle),
        icon: 'image/deployment-center/vsts.svg',
        color: '#5C2D91',
        description: this._translateService.instant(PortalResources.vsCardDescription)
    };

    public readonly vsCodeCard: DevEnvironmentCard =
    {
        id: 'vscode',
        name: this._translateService.instant(PortalResources.vscodeCardTitle),
        icon: 'image/deployment-center/vsts.svg',
        color: '#007ACC',
        description: this._translateService.instant(PortalResources.vscodeCardDescription)
    };

    public readonly coreToolsCard: DevEnvironmentCard =
    {
        id: 'coretools',
        name: this._translateService.instant(PortalResources.coretoolsCardTitle),
        icon: 'image/deployment-center/vsts.svg',
        color: '#000000',
        description: this._translateService.instant(PortalResources.coretoolsCardDescription)
    };

    public readonly mavenCard: DevEnvironmentCard =
    {
        id: 'maven',
        name: this._translateService.instant(PortalResources.mavenCardTitle),
        icon: 'image/deployment-center/vsts.svg',
        color: '#000000',
        description: this._translateService.instant(PortalResources.mavenCardDescription)
    };

    public readonly portalCard: DevEnvironmentCard =
    {
        id: 'portal',
        name: this._translateService.instant(PortalResources.portalCardTitle),
        icon: 'image/deployment-center/vsts.svg',
        color: '#0078D4',
        description: this._translateService.instant(PortalResources.portalCardDescription)
    };

    public selectedDevEnvironmentCard: DevEnvironmentCard = null;

    constructor(
        private _wizardService: QuickstartStateManager,
        private _translateService: TranslateService
    ) {
    }

    get devEnvironmentCards() {
        const workerRuntime =
            this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls &&
            this._wizardService.wizardForm.controls['workerRuntime'] &&
            this._wizardService.wizardForm.controls['workerRuntime'].value;

        const isLinux =
            this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls &&
            this._wizardService.wizardForm.controls['isLinux'] &&
            this._wizardService.wizardForm.controls['isLinux'].value;

        switch (workerRuntime) {
            case 'dotnet':
                if (isLinux) {
                    return [this.vsCodeCard, this.coreToolsCard, this.portalCard];
                }
                return [this.vsCard, this.vsCodeCard, this.coreToolsCard, this.portalCard];
            case 'node':
            case 'nodejs':
                return [this.vsCodeCard, this.coreToolsCard, this.portalCard];
            case 'python':
                return [this.vsCodeCard, this.coreToolsCard, this.portalCard];
            case 'java':
                if (isLinux) {
                    return [];
                }
                return [this.vsCodeCard, this.mavenCard];
            default:
                return [];
        }
    }

    public selectDevEnvironment(card: DevEnvironmentCard) {
        this.selectedDevEnvironmentCard = card;
        const currentFormValues = this._wizardService.wizardValues;
        currentFormValues.devEnvironment = card.id;
        this._wizardService.wizardValues = currentFormValues;
    }
}
