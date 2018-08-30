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

    public readonly vsCard: DevEnvironmentCard = {
        id: 'vs',
        name: this._translateService.instant(PortalResources.vsCardTitle),
        icon: 'image/visual_studio.svg',
        color: '#865FC5',
        description: this._translateService.instant(PortalResources.vsCardDescription)
    };

    public readonly vsCodeCard: DevEnvironmentCard = {
        id: 'vscode',
        name: this._translateService.instant(PortalResources.vscodeCardTitle),
        icon: 'image/vs_code.svg',
        color: '#0067B8',
        description: this._translateService.instant(PortalResources.vscodeCardDescription)
    };

    public readonly coreToolsCard: DevEnvironmentCard = {
        id: 'coretools',
        name: this._translateService.instant(PortalResources.coretoolsCardTitle),
        icon: 'image/terminal.svg',
        color: '#54B4D9',
        description: this._translateService.instant(PortalResources.coretoolsCardDescription)
    };

    public readonly mavenCard: DevEnvironmentCard = {
        id: 'maven',
        name: this._translateService.instant(PortalResources.mavenCardTitle),
        icon: 'image/terminal.svg',
        color: '#54B4D9',
        description: this._translateService.instant(PortalResources.mavenCardDescription)
    };

    public readonly portalCard: DevEnvironmentCard = {
        id: 'portal',
        name: this._translateService.instant(PortalResources.portalCardTitle),
        icon: 'image/azure_mgmt_portal.svg',
        color: '#54B4D9',
        description: this._translateService.instant(PortalResources.portalCardDescription)
    };

    public selectedDevEnvironmentCard: DevEnvironmentCard = null;

    constructor(
        private _wizardService: QuickstartStateManager,
        private _translateService: TranslateService
    ) {
    }

    get devEnvironmentCards() {
        const workerRuntime = this._wizardService.workerRuntime.value;
        const isLinux = this._wizardService.isLinux.value;

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
