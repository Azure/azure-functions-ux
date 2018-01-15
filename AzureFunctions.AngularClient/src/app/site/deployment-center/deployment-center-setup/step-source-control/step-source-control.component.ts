import { Component } from '@angular/core';
import { sourceControlProvider } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-setup-models';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';
import { ArmService } from 'app/shared/services/arm.service';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { AiService } from 'app/shared/services/ai.service';
import { Constants } from 'app/shared/models/constants';
import { Subject } from 'rxjs/Subject';

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
            icon: 'image/deployment-center/onedrive.svg',
            color: '#0A4BB3',
            barColor: '#D7E2F2',
            description: 'Sync content from a OneDrive cloud folder.',
            authorizedStatus: 'none'
        },
        {
            id: 'github',
            name: 'Github',
            icon: 'image/deployment-center/github.svg',
            color: '#68217A',
            barColor: '#c473d9',
            description: 'Configure continuous integration with a Github repo.',
            authorizedStatus: 'none'
        },
        {
            id: 'vsts',
            name: 'VSTS',
            icon: 'image/deployment-center/vsts.svg',
            color: '#0071bc',
            barColor: '#5ebeff',
            description: 'Configure continuous integration with a VSTS repo.',
            authorizedStatus: 'none'
        },
        {
            id: 'external',
            name: 'External',
            icon: 'image/deployment-center/External.svg',
            color: '#7FBA00',
            barColor: '#cbff5d',
            description: 'Deploy from a public Git or Mercurial repo.',
            authorizedStatus: 'none'
        },
        {
            id: 'bitbucket',
            name: 'Bitbucket',
            icon: 'image/deployment-center/Bitbucket.svg',
            color: '#205081',
            barColor: '#73a7dc',
            description: 'Configure continuous integration with a Bitbucket repo.',
            authorizedStatus: 'none'
        },
        {
            id: 'dropbox',
            name: 'Dropbox',
            icon: 'image/deployment-center/Dropbox.svg',
            color: '#007EE5',
            barColor: '#72bfff',
            description: 'Configure continuous integration with a Bitbucket repo.',
            authorizedStatus: 'none'
        },
        {
            id: 'localgit',
            name: 'Local Git',
            icon: 'image/deployment-center/LocalGit.svg',
            color: '#ba141a',
            barColor: '#f0757a',
            description: 'Deploy from a local Git repo.',
            authorizedStatus: 'none'
        }
        // {
        //     id: 'webdeploy',
        //     name: 'Web Deploy',
        //     icon: 'image/deployment-center/WebDeploy.svg',
        //     color: '#B8D432',
        //     barColor: '#dbe998',
        //     description: 'use ms deploy',
        //     authorizedStatus: 'none'
        // },
        // {
        //     id: 'ftp',
        //     name: 'FTP',
        //     icon: 'image/deployment-center/FTP.svg',
        //     color: '#FCD116',
        //     barColor: '#fde88a',
        //     description: 'Use an FTP connection to access and copy app files.',
        //     authorizedStatus: 'none'
        // }
    ];

    githubUserSubject = new Subject<boolean>();
    onedriveUserSubject = new Subject<boolean>();
    dropboxUserSubject = new Subject<boolean>();
    bitbucketUserSubject = new Subject<boolean>();

    public selectedProvider: ProviderCard = null;

    private _ngUnsubscribe = new Subject();

    constructor(
        private _wizardService: DeploymentCenterWizardService,
        private _cacheService: CacheService,
        _portalService: PortalService,
        _armService: ArmService,
        _aiService: AiService
    ) {
        this.githubUserSubject
            .takeUntil(this._ngUnsubscribe)
            .filter(r => r)
            .switchMap(() =>
                _cacheService.post(Constants.serviceHost + 'api/github/passthrough', true, null, {
                    url: 'https://api.github.com/user'
                })
            )
            .subscribe(r => {
                this.providerCards[1].authenticatedId = r.json().login;
                this.providerCards[1].authorizedStatus = 'authorized';
            });

        this.bitbucketUserSubject
            .takeUntil(this._ngUnsubscribe)
            .filter(r => r)
            .switchMap(() =>
                _cacheService.post(Constants.serviceHost + 'api/bitbucket/passthrough', true, null, {
                    url: 'https://api.bitbucket.org/2.0/user'
                })
            )
            .subscribe(r => {
                this.providerCards[4].authenticatedId = r.json().display_name;
                this.providerCards[4].authorizedStatus = 'authorized';
            });

        this.onedriveUserSubject
            .takeUntil(this._ngUnsubscribe)
            .filter(r => r)
            .switchMap(() =>
                _cacheService.post(Constants.serviceHost + 'api/onedrive/passthrough', true, null, {
                    url: 'https://api.onedrive.com/v1.0/drive'
                })
            )
            .subscribe(r => {
                this.providerCards[0].authenticatedId = r.json().owner.user.displayName;
                this.providerCards[0].authorizedStatus = 'authorized';
            });

        this.dropboxUserSubject
            .takeUntil(this._ngUnsubscribe)
            .filter(r => r)
            .switchMap(() =>
                _cacheService.post(Constants.serviceHost + 'api/dropbox/passthrough', true, null, {
                    url: 'https://api.dropboxapi.com/2/users/get_current_account'
                })
            )
            .subscribe(r => {
                this.providerCards[5].authenticatedId = r.json().name.display_name;
                this.providerCards[5].authorizedStatus = 'authorized';
            });

        this._wizardService.resourceIdStream
            .takeUntil(this._ngUnsubscribe)
            .switchMap(r => {
                this.providerCards[0].authorizedStatus = 'loadingAuth';
                this.providerCards[1].authorizedStatus = 'loadingAuth';
                this.providerCards[4].authorizedStatus = 'loadingAuth';
                this.providerCards[5].authorizedStatus = 'loadingAuth';
                return this._cacheService.get(Constants.serviceHost + 'api/SourceControlAuthenticationState');
            })
            .subscribe(dep => {
                const r = dep.json();

                if (r.onedrive) {
                    this.onedriveUserSubject.next(r.onedrive);
                } else {
                    this.providerCards[0].authorizedStatus = 'notAuthorized';
                }

                if (r.dropbox) {
                    this.dropboxUserSubject.next(r.dropbox);
                } else {
                    this.providerCards[5].authorizedStatus = 'notAuthorized';
                }

                if (r.github) {
                    this.githubUserSubject.next(r.github);
                } else {
                    this.providerCards[1].authorizedStatus = 'notAuthorized';
                }

                if (r.bitbucket) {
                    this.bitbucketUserSubject.next(r.bitbucket);
                } else {
                    this.providerCards[4].authorizedStatus = 'notAuthorized';
                }
            });
    }

    public selectProvider(card: ProviderCard) {
        this.selectedProvider = card;
        this._wizardService.wizardForm.controls['sourceProvider'].setValue(card.id, { onlySelf: true });
    }

    public authorize() {
        let provider = this.selectedProvider.id;
        var win = window.open(`${Constants.serviceHost}auth/${provider}/authorize`, 'windowname1', 'width=800, height=600');

        var pollTimer = window.setInterval(() => {
            try {
                if (win.document.URL.indexOf(`/callback`) != -1) {
                    window.clearInterval(pollTimer);

                    this._cacheService
                        .post(`${Constants.serviceHost}auth/${provider}/storeToken`, true, null, {
                            redirUrl: win.document.URL
                        })
                        .subscribe(() => {
                            win.close();
                        });
                }
            } catch (e) {}
        }, 100);
    }
}
