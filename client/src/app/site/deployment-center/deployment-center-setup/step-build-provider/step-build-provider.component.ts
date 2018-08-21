import { Component } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { ProviderCard } from '../../Models/provider-card';
import { ScenarioIds } from '../../../../shared/models/constants';
import { from } from 'rxjs/observable/from';
import { ScenarioService } from '../../../../shared/services/scenario/scenario.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { of } from 'rxjs/observable/of';
@Component({
    selector: 'app-step-build-provider',
    templateUrl: './step-build-provider.component.html',
    styleUrls: ['./step-build-provider.component.scss', '../deployment-center-setup.component.scss']
})
export class StepBuildProviderComponent {
    public readonly providerCards: ProviderCard[] = [
        {
            id: 'kudu',
            name: this._translateService.instant(PortalResources.kuduTitle),
            icon: 'image/deployment-center/kudu.svg',
            color: '#000000',
            description: this._translateService.instant(PortalResources.kuduDesc),
            authorizedStatus: 'none',
            enabled: true
        },
        {
            id: 'vsts',
            name: this._translateService.instant(PortalResources.vstsBuildServerTitle),
            icon: 'image/deployment-center/vsts.svg',
            color: '#2B79DA',
            description: this._translateService.instant(PortalResources.vstsBuildServerDesc),
            authorizedStatus: 'none',
            enabled: false,
            scenarioId: ScenarioIds.vstsDeployment,
            errorMessage: 'errorMessage errorMessage errorMessage '
        }
    ];

    constructor(public wizard: DeploymentCenterStateManager, private _translateService: TranslateService, scenarioService: ScenarioService) {
        from(this.providerCards).switchMap((provider: ProviderCard) => {
            return forkJoin(of(provider), scenarioService.checkScenarioAsync(provider.scenarioId, { site: wizard.siteArm }));
        })
        .subscribe(([provider, scenarioCheck]) => {
            provider.enabled = scenarioCheck.status === 'disabled';
            provider.errorMessage = scenarioCheck.data;
        });
    }

    chooseBuildProvider(card: ProviderCard) {
        if (card.enabled) {
            const currentFormValues = this.wizard.wizardValues;
            currentFormValues.buildProvider = card.id;
            this.wizard.wizardValues = currentFormValues;
        }
    }
}
