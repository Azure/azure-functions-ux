import { Component } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { CacheService } from 'app/shared/services/cache.service';
import { Constants, LogCategories, ScenarioIds } from 'app/shared/models/constants';
import { Subject } from 'rxjs/Subject';
import { LogService } from 'app/shared/services/log.service';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { ProviderCard } from '../../Models/provider-card';
import { BroadcastService } from '../../../../shared/services/broadcast.service';
import { BroadcastEvent } from '../../../../shared/models/broadcast-event';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { ScenarioService } from '../../../../shared/services/scenario/scenario.service';

@Component({
    selector: 'app-step-source-control',
    templateUrl: './step-source-control.component.html',
    styleUrls: ['./step-source-control.component.scss', '../deployment-center-setup.component.scss']
})
export class StepSourceControlComponent {

    private _authProviderSpots = {
        onedrive: 4,
        github: 1,
        bitbucket: 2,
        dropbox: 5
    };

    public readonly _allProviders: ProviderCard[] = [
        {
            id: 'vsts',
            name: 'VSTS',
            icon: 'image/deployment-center/vsts.svg',
            color: '#2B79DA',
            description: this._translateService.instant(PortalResources.vstsDesc),
            authorizedStatus: 'none',
            enabled: true,
            scenarioId: ScenarioIds.vstsSource
        },
        {
            id: 'github',
            name: 'Github',
            icon: 'image/deployment-center/github.svg',
            color: '#68217A',
            description: this._translateService.instant(PortalResources.githubDesc),
            authorizedStatus: 'none',
            enabled: true,
            scenarioId: ScenarioIds.githubSource
        },
        {
            id: 'bitbucket',
            name: 'Bitbucket',
            icon: 'image/deployment-center/Bitbucket.svg',
            color: '#205081',
            description: this._translateService.instant(PortalResources.bitbucketDesc),
            authorizedStatus: 'none',
            enabled: true,
            scenarioId: ScenarioIds.bitbucketSource
        },
        {
            id: 'localgit',
            name: 'Local Git',
            icon: 'image/deployment-center/LocalGit.svg',
            color: '#ba141a',
            description: this._translateService.instant(PortalResources.localGitDesc),
            authorizedStatus: 'none',
            enabled: true,
            scenarioId: ScenarioIds.localGitSource
        },
        {
            id: 'onedrive',
            name: 'OneDrive',
            icon: 'image/deployment-center/onedrive.svg',
            color: '#0A4BB3',
            description: this._translateService.instant(PortalResources.onedriveDesc),
            authorizedStatus: 'none',
            enabled: true,
            scenarioId: ScenarioIds.ondriveSource
        },
        {
            id: 'dropbox',
            name: 'Dropbox',
            icon: 'image/deployment-center/Dropbox.svg',
            color: '#007EE5',
            description: this._translateService.instant(PortalResources.dropboxDesc),
            authorizedStatus: 'none',
            enabled: true,
            scenarioId: ScenarioIds.dropboxSource
        },
        {
            id: 'external',
            name: 'External',
            icon: 'image/deployment-center/External.svg',
            color: '#7FBA00',
            description: this._translateService.instant(PortalResources.externalDesc),
            authorizedStatus: 'none',
            enabled: true,
            scenarioId: ScenarioIds.externalSource
        },
        {
            id: 'ftp',
            name: 'FTP',
            icon: 'image/deployment-center/FTP.svg',
            color: '#FCD116',
            description: this._translateService.instant(PortalResources.ftpDesc),
            authorizedStatus: 'none',
            manual: true,
            enabled: true,
            scenarioId: ScenarioIds.ftpSource
        }
    ];

    providerCards: ProviderCard[] = [];

    githubUserSubject$ = new Subject<boolean>();
    onedriveUserSubject$ = new Subject<boolean>();
    dropboxUserSubject$ = new Subject<boolean>();
    bitbucketUserSubject$ = new Subject<boolean>();

    public selectedProvider: ProviderCard = null;

    private _ngUnsubscribe$ = new Subject();

    constructor(
        private _wizardService: DeploymentCenterStateManager,
        private _cacheService: CacheService,
        private _logService: LogService,
        private _translateService: TranslateService,
        private _broadcastService: BroadcastService,
        scenarioService: ScenarioService
    ) {
        this.githubUserSubject$
            .takeUntil(this._ngUnsubscribe$)
            .filter(r => r)
            .do(() => {
                this.providerCards[this._authProviderSpots.github].authorizedStatus = 'loadingAuth';
            })
            .delay(3000)
            .switchMap(() =>
                _cacheService.post(Constants.serviceHost + 'api/github/passthrough', true, null, {
                    url: 'https://api.github.com/user',
                    authToken: this._wizardService.getToken()
                })
            )
            .subscribe(
                r => {
                    this.providerCards[this._authProviderSpots.github].authenticatedId = r.json().login;
                    this.providerCards[this._authProviderSpots.github].authorizedStatus = 'authorized';
                },
                err => {
                    this._logService.error(LogCategories.cicd, '/fetch-github-user', err);
                }
            );

        this.bitbucketUserSubject$
            .takeUntil(this._ngUnsubscribe$)
            .filter(r => r)
            .do(() => {
                this.providerCards[this._authProviderSpots.bitbucket].authorizedStatus = 'loadingAuth';
            })

            .delay(3000)
            .switchMap(() =>
                _cacheService.post(Constants.serviceHost + 'api/bitbucket/passthrough', true, null, {
                    url: 'https://api.bitbucket.org/2.0/user',
                    authToken: this._wizardService.getToken()
                })
            )
            .subscribe(
                r => {
                    this.providerCards[this._authProviderSpots.bitbucket].authenticatedId = r.json().display_name;
                    this.providerCards[this._authProviderSpots.bitbucket].authorizedStatus = 'authorized';
                },
                err => {
                    this._logService.error(LogCategories.cicd, '/fetch-bitbucket-user', err);
                }
            );

        this.onedriveUserSubject$
            .takeUntil(this._ngUnsubscribe$)
            .filter(r => r)
            .do(() => {
                this.providerCards[this._authProviderSpots.onedrive].authorizedStatus = 'loadingAuth';
            })

            .delay(3000)
            .switchMap(() =>
                _cacheService.post(Constants.serviceHost + 'api/onedrive/passthrough', true, null, {
                    url: 'https://api.onedrive.com/v1.0/drive',
                    authToken: this._wizardService.getToken()
                })
            )
            .subscribe(
                r => {
                    this.providerCards[this._authProviderSpots.onedrive].authenticatedId = r.json().owner.user.displayName;
                    this.providerCards[this._authProviderSpots.onedrive].authorizedStatus = 'authorized';
                },
                err => {
                    this._logService.error(LogCategories.cicd, '/fetch-onedrive-user', err);
                }
            );

        this.dropboxUserSubject$
            .takeUntil(this._ngUnsubscribe$)
            .filter(r => r)
            .do(() => {
                this.providerCards[this._authProviderSpots.dropbox].authorizedStatus = 'loadingAuth';
            })
            .delay(3000)
            .switchMap(() =>
                _cacheService.post(Constants.serviceHost + 'api/dropbox/passthrough', true, null, {
                    url: 'https://api.dropboxapi.com/2/users/get_current_account',
                    authToken: this._wizardService.getToken()
                })
            )
            .subscribe(
                r => {
                    this.providerCards[this._authProviderSpots.dropbox].authenticatedId = r.json().name.display_name;
                    this.providerCards[this._authProviderSpots.dropbox].authorizedStatus = 'authorized';
                },
                err => {
                    this._logService.error(LogCategories.cicd, '/fetch-dropbox-user', err);
                }
            );

        this._wizardService.resourceIdStream$
            .takeUntil(this._ngUnsubscribe$)
            .switchMap(r => this._cacheService.post(Constants.serviceHost + 'api/SourceControlAuthenticationState', true, null, {
                authToken: this._wizardService.getToken()
            }))
            .subscribe(
                dep => {
                    const r = dep.json();

                    if (r.onedrive) {
                        this.onedriveUserSubject$.next(r.onedrive);
                    } else {
                        this.providerCards[this._authProviderSpots.onedrive].authorizedStatus = 'notAuthorized';
                    }

                    if (r.dropbox) {
                        this.dropboxUserSubject$.next(r.dropbox);
                    } else {
                        this.providerCards[this._authProviderSpots.dropbox].authorizedStatus = 'notAuthorized';
                    }

                    if (r.github) {
                        this.githubUserSubject$.next(r.github);
                    } else {
                        this.providerCards[this._authProviderSpots.github].authorizedStatus = 'notAuthorized';
                    }

                    if (r.bitbucket) {
                        this.bitbucketUserSubject$.next(r.bitbucket);
                    } else {
                        this.providerCards[this._authProviderSpots.bitbucket].authorizedStatus = 'notAuthorized';
                    }
                },
                err => {
                    this._logService.error(LogCategories.cicd, '/fetch-current-auth-state', err);
                }
            );

        this._wizardService.siteArmObj$.subscribe(SiteObj => {
            if (SiteObj) {
                this._allProviders.forEach(provider => {
                    provider.enabled = scenarioService.checkScenario(provider.scenarioId, { site: SiteObj }).status !== 'disabled';
                    if(provider.enabled){
                        this.providerCards.push(provider);
                    }
                });
            }
        });
    }

    public selectProvider(card: ProviderCard) {
        this.selectedProvider = card;
        const currentFormValues = this._wizardService.wizardValues;
        currentFormValues.sourceProvider = card.id;
        currentFormValues.buildProvider = 'kudu'; // Not all providers are supported by VSTS, however all providers are supported by kudu so this is a safe default
        this._wizardService.wizardValues = currentFormValues;
    }

    renderDashboard() {
        this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter, this._wizardService.wizardValues.sourceProvider);
    }

    updateProvider(provider: string) {
        if (provider === 'dropbox') {
            this.dropboxUserSubject$.next(true);
        } else if (provider === 'github') {
            this.githubUserSubject$.next(true);
        } else if (provider === 'onedrive') {
            this.onedriveUserSubject$.next(true);
        } else if (provider === 'bitbucket') {
            this.bitbucketUserSubject$.next(true);
        }
    }
    public authorize() {
        const provider = this.selectedProvider.id;
        const win = window.open(`${Constants.serviceHost}auth/${provider}/authorize`, 'windowname1', 'width=800, height=600');
        const clearInterval = new Subject();
        Observable.timer(100, 100).takeUntil(this._ngUnsubscribe$).takeUntil(clearInterval).subscribe(() => {
            try {
                if (win.closed) {
                    clearInterval.next();
                } else if (win.document.URL.indexOf(`/callback`) !== -1) {
                    clearInterval.next();

                    this._cacheService
                        .post(`${Constants.serviceHost}auth/${provider}/storeToken`, true, null, {
                            redirUrl: win.document.URL,
                            authToken: this._wizardService.getToken()
                        })
                        .subscribe(() => {
                            this.updateProvider(provider);
                            win.close();
                        });
                }
            } catch (e) { }
        });
    }
}
