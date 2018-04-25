import { Component } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { ArmService } from 'app/shared/services/arm.service';
import { PortalService } from 'app/shared/services/portal.service';
import { CacheService } from 'app/shared/services/cache.service';
import { AiService } from 'app/shared/services/ai.service';
import { Constants, LogCategories } from 'app/shared/models/constants';
import { Subject } from 'rxjs/Subject';
import { LogService } from 'app/shared/services/log.service';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { ProviderCard } from '../../Models/provider-card';

@Component({
    selector: 'app-step-source-control',
    templateUrl: './step-source-control.component.html',
    styleUrls: ['./step-source-control.component.scss', '../deployment-center-setup.component.scss']
})
export class StepSourceControlComponent {

   private _authProviderSpots = {
        onedrive: 0,
        github: 1,
        bitbucket: 4,
        dropbox: 5
    };

    public readonly providerCards: ProviderCard[] = [
        {
            id: 'onedrive',
            name: 'OneDrive',
            icon: 'image/deployment-center/onedrive.svg',
            color: '#0A4BB3',
            barColor: '#D7E2F2',
            description: this._translateService.instant('onedriveDesc'),
            authorizedStatus: 'none'
        },
        {
            id: 'github',
            name: 'Github',
            icon: 'image/deployment-center/github.svg',
            color: '#68217A',
            barColor: '#c473d9',
            description: this._translateService.instant('githubDesc'),
            authorizedStatus: 'none'
        },
        {
            id: 'vsts',
            name: 'VSTS',
            icon: 'image/deployment-center/vsts.svg',
            color: '#0071bc',
            barColor: '#5ebeff',
            description: this._translateService.instant('vstsDesc'),
            authorizedStatus: 'none'
        },
        {
            id: 'external',
            name: 'External',
            icon: 'image/deployment-center/External.svg',
            color: '#7FBA00',
            barColor: '#cbff5d',
            description: this._translateService.instant('externalDesc'),
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
            description: this._translateService.instant('dropboxDesc'),
            authorizedStatus: 'none'
        },
        {
            id: 'localgit',
            name: 'Local Git',
            icon: 'image/deployment-center/LocalGit.svg',
            color: '#ba141a',
            barColor: '#f0757a',
            description: this._translateService.instant('localGitDesc'),
            authorizedStatus: 'none'
        }
        // These are options in works, not wanting to delete though
        // {
        //     id: 'webdeploy',
        //     name: 'Web Deploy',
        //     icon: 'image/deployment-center/WebDeploy.svg',
        //     color: '#B8D432',
        //     barColor: '#dbe998',
        //     description: 'use ms deploy',
        //     authorizedStatus: 'none',
        //     manual: true
        // },
        // {
        //     id: 'ftp',
        //     name: 'FTP',
        //     icon: 'image/deployment-center/FTP.svg',
        //     color: '#FCD116',
        //     barColor: '#fde88a',
        //     description: 'Use an FTP connection to access and copy app files.',
        //     authorizedStatus: 'none',
        //     manual: true
        // }
        // ,
        // {
        //     id: 'zip',
        //     name: 'Run From Zip',
        //     icon: 'image/deployment-center/FTP.svg',
        //     color: '#FCD116',
        //     barColor: '#fde88a',
        //     description: 'Use the run from zip method of deployment.',
        //     authorizedStatus: 'none',
        //     manual: true
        // }
    ];

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
        _portalService: PortalService,
        _armService: ArmService,
        _aiService: AiService
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
                    url: 'https://api.github.com/user'
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
                    url: 'https://api.bitbucket.org/2.0/user'
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
                    url: 'https://api.onedrive.com/v1.0/drive'
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
                    url: 'https://api.dropboxapi.com/2/users/get_current_account'
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
            .switchMap(r => this._cacheService.get(Constants.serviceHost + 'api/SourceControlAuthenticationState'))
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
    }

    public selectProvider(card: ProviderCard) {
        this.selectedProvider = card;
        const currentFormValues = this._wizardService.wizardValues;
        currentFormValues.sourceProvider = card.id;
        currentFormValues.buildProvider = 'kudu'; // Not all providers are supported by VSTS, however all providers are supported by kudu so this is a safe default
        this._wizardService.wizardValues = currentFormValues;
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
                            redirUrl: win.document.URL
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
