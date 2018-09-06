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
    styleUrls: ['./step-build-provider.component.scss', '../deployment-center-setup.component.scss'],
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
            enabled: true,
            errorMessage: 'This option is unavailable for VSTS Source on Linux Web Apps',
        },
        {
            id: 'vsts',
            name: this._translateService.instant(PortalResources.vstsBuildServerTitle),
            icon: 'image/deployment-center/vsts.svg',
            color: '#2B79DA',
            description: this._translateService.instant(PortalResources.vstsBuildServerDesc),
            authorizedStatus: 'none',
            enabled: false,
            scenarioId: ScenarioIds.vstsDeploymentPermission,
        },
    ];

    private _vstsKuduSourceScenarioBlocked = false;
    constructor(
        public wizard: DeploymentCenterStateManager,
        private _translateService: TranslateService,
        private _scenarioService: ScenarioService) {

        // runs scenario checker for each provider to determine if it should be enabled or not
        // if not enabled then it pulls error message from scenario checker
        wizard.siteArmObj$
            .concatMap(siteObj => {
                return from(this.providerCards).switchMap((provider: ProviderCard) => {
                    if (provider.scenarioId) {
                        return forkJoin(of(provider), this._scenarioService.checkScenarioAsync(provider.scenarioId, { site: siteObj }));
                    } else {
                        return of([null, null]);
                    }
                });
            })
            .subscribe(([provider, scenarioCheck]) => {
                if (provider) {
                    provider.enabled = scenarioCheck.status !== 'disabled';
                    provider.errorMessage = scenarioCheck.data && scenarioCheck.data.errorMessage;
                }
            });

        this.wizard.wizardForm.controls.sourceProvider.valueChanges.subscribe((provider) => {
            const kuduCard = this.providerCards.find(x => x.id === 'kudu');
            if (provider === 'vsts' &&  this._vstsKuduSourceScenarioBlocked) {
                this.chooseBuildProvider({ id: 'vsts', enabled: true } as ProviderCard);
                kuduCard.enabled = false;
            } else {
                this.chooseBuildProvider({ id: 'kudu', enabled: true } as ProviderCard);
                kuduCard.enabled = true;
            }
        });
        // this says if kudu should be hidden then default to vsts instead
        wizard.siteArmObj$
            .map(siteObj => {
                return this._scenarioService.checkScenario(ScenarioIds.vstsKuduSource, { site: siteObj });
            })
            .subscribe(result => {
                this._vstsKuduSourceScenarioBlocked = result.status === 'disabled';
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
