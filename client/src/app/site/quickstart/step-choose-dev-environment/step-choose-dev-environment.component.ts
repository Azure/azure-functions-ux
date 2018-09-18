import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { TranslateService } from '@ngx-translate/core';
import { DevEnvironmentCard } from '../Models/dev-environment-card';
import { PortalResources } from '../../../shared/models/portal-resources';
import { workerRuntimeOptions } from 'app/site/quickstart/wizard-logic/quickstart-models';
@Component({
    selector: 'step-choose-dev-environment',
    templateUrl: './step-choose-dev-environment.component.html',
    styleUrls: ['./step-choose-dev-environment.component.scss', '../quickstart.component.scss'],
})
export class StepChooseDevEnvironmentComponent {

    public readonly vsCard: DevEnvironmentCard = {
        id: 'vs',
        name: this._translateService.instant(PortalResources.vsCardTitle),
        icon: 'image/visual_studio.svg',
        color: '#865FC5',
        description: this._translateService.instant(PortalResources.vsCardDescription),
    };

    public readonly vsCodeCard: DevEnvironmentCard = {
        id: 'vscode',
        name: this._translateService.instant(PortalResources.vscodeCardTitle),
        icon: 'image/vs_code.svg',
        color: '#0067B8',
        description: this._translateService.instant(PortalResources.vscodeCardDescription),
    };

    public readonly coreToolsCard: DevEnvironmentCard = {
        id: 'coretools',
        name: this._translateService.instant(PortalResources.coretoolsCardTitle),
        icon: 'image/terminal.svg',
        color: '#54B4D9',
        description: this._translateService.instant(PortalResources.coretoolsCardDescription),
    };

    public readonly mavenCard: DevEnvironmentCard = {
        id: 'maven',
        name: this._translateService.instant(PortalResources.mavenCardTitle),
        icon: 'image/terminal.svg',
        color: '#54B4D9',
        description: this._translateService.instant(PortalResources.mavenCardDescription),
    };

    public readonly portalCard: DevEnvironmentCard = {
        id: 'portal',
        name: this._translateService.instant(PortalResources.portalCardTitle),
        icon: 'image/azure_mgmt_portal.svg',
        color: '#54B4D9',
        description: this._translateService.instant(PortalResources.portalCardDescription),
    };

    public selectedDevEnvironmentCard: DevEnvironmentCard = null;
    public workerRuntime: workerRuntimeOptions;
    public devEnvironmentCards: DevEnvironmentCard[];
    public isLinux: boolean;
    public isLinuxConsumption: boolean;

    constructor(
        private _wizardService: QuickstartStateManager,
        private _translateService: TranslateService) {

        this.workerRuntime = this._wizardService.workerRuntime.value;
        this.isLinux = this._wizardService.isLinux.value;
        this.isLinuxConsumption = this._wizardService.isLinuxConsumption.value;
        this.devEnvironmentCards = this._getDevEnvironmentCards();

        this._wizardService.workerRuntime.statusChanges.subscribe(() => {
            this.workerRuntime = this._wizardService.workerRuntime.value;
            this.devEnvironmentCards = this._getDevEnvironmentCards();
        });

        this._wizardService.isLinux.statusChanges.subscribe(() => {
            this.isLinux = this._wizardService.isLinux.value;
            this.devEnvironmentCards = this._getDevEnvironmentCards();
        });

        this._wizardService.isLinuxConsumption.statusChanges.subscribe(() => {
            this.isLinuxConsumption = this._wizardService.isLinuxConsumption.value;
            this.devEnvironmentCards = this._getDevEnvironmentCards();
        });
    }

    public selectDevEnvironment(card: DevEnvironmentCard) {
        this.selectedDevEnvironmentCard = card;
        this._wizardService.devEnvironment.setValue(card.id);
    }

    private _getDevEnvironmentCards(): DevEnvironmentCard[] {
        switch (this.workerRuntime) {
            case 'dotnet':
                return this._dotnetEnvironmentCards();
            case 'node':
            case 'nodejs':
                return this._nodeEnvironmentCards();
            case 'python':
                return this._pythonEnvironmentCards();
            case 'java':
                return this._javaEnvironmentCards();
            default:
                return [];
        }
    }

    private _dotnetEnvironmentCards(): DevEnvironmentCard[] {
        if (this.isLinux) {
            if (this.isLinuxConsumption) {
                return [this.vsCodeCard, this.coreToolsCard];
            }
            return [this.vsCodeCard, this.coreToolsCard, this.portalCard];
        }
        return [this.vsCard, this.vsCodeCard, this.coreToolsCard, this.portalCard];
    }

    private _nodeEnvironmentCards(): DevEnvironmentCard[] {
        if (this.isLinuxConsumption) {
            return [this.vsCodeCard, this.coreToolsCard];
        }
        return [this.vsCodeCard, this.coreToolsCard, this.portalCard];
    }

    private _pythonEnvironmentCards(): DevEnvironmentCard[] {
        if (this.isLinuxConsumption) {
            return [this.vsCodeCard, this.coreToolsCard];
        }
        return [this.vsCodeCard, this.coreToolsCard, this.portalCard];
    }

    private _javaEnvironmentCards(): DevEnvironmentCard[] {
        if (this.isLinux) {
            return [];
        }
        return [this.vsCodeCard, this.mavenCard];
    }
}
