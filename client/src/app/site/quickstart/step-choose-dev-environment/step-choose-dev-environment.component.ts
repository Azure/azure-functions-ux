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

    public readonly devEnvironmentCards: DevEnvironmentCard[] = [
        {
            id: 'vs',
            name: 'Visual Studio',
            icon: 'image/deployment-center/vsts.svg',
            color: '#2B79DA',
            description: this._translateService.instant(PortalResources.vstsDesc)
        },
        {
            id: 'vscode',
            name: 'Visual Stuido Code',
            icon: 'image/deployment-center/github.svg',
            color: '#68217A',
            description: this._translateService.instant(PortalResources.githubDesc)
        },
        {
            id: 'external',
            name: 'External',
            icon: 'image/deployment-center/Bitbucket.svg',
            color: '#205081',
            description: this._translateService.instant(PortalResources.bitbucketDesc)
        },
        {
            id: 'portal',
            name: 'Portal',
            icon: 'image/deployment-center/LocalGit.svg',
            color: '#ba141a',
            description: this._translateService.instant(PortalResources.localGitDesc)
        }

    ];
    public selectedDevEnvironmentCard: DevEnvironmentCard = null;

    constructor(
        private _wizardService: QuickstartStateManager,
        private _translateService: TranslateService,
    ) {
    }

    public selectDevEnvironment(card: DevEnvironmentCard) {
        this.selectedDevEnvironmentCard = card;
        const currentFormValues = this._wizardService.wizardValues;
        currentFormValues.devEnvironment = card.id;
        this._wizardService.wizardValues = currentFormValues;
    }

    
}
