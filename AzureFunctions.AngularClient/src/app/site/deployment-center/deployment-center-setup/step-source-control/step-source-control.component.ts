import { Component } from '@angular/core';
import { sourceControlProvider } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-setup-models';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';
import { ArmService } from 'app/shared/services/arm.service';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { AiService } from 'app/shared/services/ai.service';
//import { Observable } from 'rxjs/Observable';
import { Constants } from 'app/shared/models/constants';
import { Observable } from 'rxjs/Observable';

export interface ProviderCard {
    id: sourceControlProvider;
    name: string;
    icon: string;
    color: string;
    barColor: string;
    description: string;
    authorizedStatus: 'loadingAuth' | 'notAuthorized' | 'authorized' | 'none';
    authenticatedId?: string;
}

@Component({
    selector: 'app-step-source-control',
    templateUrl: './step-source-control.component.html',
    styleUrls: ['./step-source-control.component.scss']
})
export class StepSourceControlComponent {
    public readonly providerCards: ProviderCard[] = [
        {
            id: 'onedrive',
            name: 'OneDrive',
            icon: 'images/deployment-center/onedrive-logo.svg',
            color: '#0A4AB1',
            barColor: '#D7E2F2',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
            authorizedStatus: 'none'
        },
        {
            id: 'github',
            name: 'Github',
            icon: 'images/deployment-center/onedrive-logo.svg',
            color: '#000000',
            barColor: '#D6D6D6',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
            authorizedStatus: 'none'
        },
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
            id: 'external',
            name: 'External',
            icon: 'images/deployment-center/onedrive-logo.svg',
            color: '#9E0F00',
            barColor: '#EFD8D6',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
            authorizedStatus: 'none'
        },
        {
            id: 'bitbucket',
            name: 'Bitbucket',
            icon: 'images/deployment-center/onedrive-logo.svg',
            color: '#215081',
            barColor: '#DBE3EB',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
            authorizedStatus: 'none'
        },
        {
            id: 'localgit',
            name: 'Local Git',
            icon: 'images/deployment-center/onedrive-logo.svg',
            color: '#FFB901',
            barColor: '#FFF2D1',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
            authorizedStatus: 'none'
        },
        {
            id: 'ftp',
            name: 'FTP',
            icon: 'images/deployment-center/onedrive-logo.svg',
            color: '#F46300',
            barColor: '#FDE6D6',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
            authorizedStatus: 'none'
        }
    ];

    public selectedProvider: ProviderCard = null;
    githubUsername: string;

    constructor(
        private _wizardService: DeploymentCenterWizardService,
        _portalService: PortalService,
        _cacheService: CacheService,
        _armService: ArmService,
        _aiService: AiService
    ) {
        this._wizardService.resourceIdStream.switchMap(r => {

            this.providerCards[0].authorizedStatus = 'loadingAuth';
            this.providerCards[1].authorizedStatus = 'loadingAuth';
            this.providerCards[4].authorizedStatus = 'loadingAuth';
            return _cacheService.get(Constants.serviceHost + 'api/SourceControlAuthenticationState');
        })
        .switchMap(dep=>{
            const r = dep.json();
            this.providerCards[0].authorizedStatus = r.onedrive ? 'authorized' : 'notAuthorized';
            this.providerCards[1].authorizedStatus = r.github ? 'authorized' : 'notAuthorized';
            this.providerCards[4].authorizedStatus = r.bitbucket ? 'authorized' : 'notAuthorized';

            return Observable.zip(
                _cacheService.post(Constants.serviceHost + 'api/github/passthrough', true,null, {
                    url: 'https://api.github.com/user'
                }),
                _cacheService.post(Constants.serviceHost + 'api/onedrive/passthrough', true,null, {
                    url: 'https://api.onedrive.com/v1.0/drive'
                }),
                 _cacheService.post(Constants.serviceHost + 'api/bitbucket/passthrough', true,null, {
                     url: 'https://api.bitbucket.org/2.0/user'
                 }),
                (github, onedrive, bitbucket) => ({
                    github: github.json(),
                    onedrive: onedrive.json(),
                    bitbucket: bitbucket.json()
                }));
        })
        .subscribe(r => {
            this.providerCards[1].authenticatedId = `${r.github.name} (${r.github.login})`;
            this.providerCards[0].authenticatedId = r.onedrive.owner.user.displayName;
            this.providerCards[4].authenticatedId = r.bitbucket.display_name;
        });
    }

    public selectProvider(card: ProviderCard) {
        this.selectedProvider = card;
        this._wizardService.changeSourceControlProvider(card.id);
    }

    public authorize(card: ProviderCard) {
        console.log(`authorize: ${card.name}`);
    }
}
