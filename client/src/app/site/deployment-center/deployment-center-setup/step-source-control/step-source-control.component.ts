import { Component } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { CacheService } from 'app/shared/services/cache.service';
import { Constants, LogCategories, ScenarioIds, KeyCodes } from 'app/shared/models/constants';
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
  styleUrls: ['./step-source-control.component.scss', '../deployment-center-setup.component.scss'],
})
export class StepSourceControlComponent {
  public readonly _allProviders: ProviderCard[] = [
    {
      id: 'vsts',
      name: 'Azure Repos',
      icon: 'image/deployment-center/AzureDevOps.svg',
      color: '#2B79DA',
      description: this._translateService.instant(PortalResources.vstsDesc),
      authorizedStatus: 'none',
      enabled: true,
      scenarioId: ScenarioIds.vstsSource,
      deploymentType: 'continuous',
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: 'image/deployment-center/GitHubLogo.svg',
      color: '#68217A',
      description: this._translateService.instant(PortalResources.githubDesc),
      authorizedStatus: 'none',
      enabled: true,
      scenarioId: ScenarioIds.githubSource,
      deploymentType: 'continuous',
    },
    {
      id: 'bitbucket',
      name: 'Bitbucket',
      icon: 'image/deployment-center/Bitbucket.svg',
      color: '#205081',
      description: this._translateService.instant(PortalResources.bitbucketDesc),
      authorizedStatus: 'none',
      enabled: true,
      scenarioId: ScenarioIds.bitbucketSource,
      deploymentType: 'continuous',
    },
    {
      id: 'localgit',
      name: 'Local Git',
      icon: 'image/deployment-center/GitLogo.svg',
      color: '#ba141a',
      description: this._translateService.instant(PortalResources.localGitDesc),
      authorizedStatus: 'none',
      enabled: true,
      scenarioId: ScenarioIds.localGitSource,
      deploymentType: 'continuous',
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: 'image/deployment-center/onedrive.svg',
      color: '#0A4BB3',
      description: this._translateService.instant(PortalResources.onedriveDesc),
      authorizedStatus: 'none',
      enabled: true,
      scenarioId: ScenarioIds.onedriveSource,
      deploymentType: 'manual',
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: 'image/deployment-center/Dropbox.svg',
      color: '#007EE5',
      description: this._translateService.instant(PortalResources.dropboxDesc),
      authorizedStatus: 'none',
      enabled: true,
      scenarioId: ScenarioIds.dropboxSource,
      deploymentType: 'manual',
    },
    {
      id: 'external',
      name: 'External',
      icon: 'image/deployment-center/ExternalGit.svg',
      color: '#7FBA00',
      description: this._translateService.instant(PortalResources.externalDesc),
      authorizedStatus: 'none',
      enabled: true,
      scenarioId: ScenarioIds.externalSource,
      deploymentType: 'manual',
    },
    {
      id: 'ftp',
      name: 'FTP',
      icon: 'image/deployment-center/FTP.svg',
      color: '#FD5C00',
      description: this._translateService.instant(PortalResources.ftpDesc),
      authorizedStatus: 'none',
      manual: true,
      enabled: true,
      scenarioId: ScenarioIds.ftpSource,
      deploymentType: 'manual',
    },
  ];

  public authStateError = false;
  private _githubAuthed = false;
  private _onedriveAuthed = false;
  private _dropboxAuthed = false;
  private _bitbucketAuthed = false;

  continuousDeploymentProviderCards: ProviderCard[] = [];
  manualDeploymentProviderCards: ProviderCard[] = [];

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
    private _scenarioService: ScenarioService
  ) {
    this._logService.trace(LogCategories.cicd, '/load-source-selector');

    this.githubUserSubject$
      .takeUntil(this._ngUnsubscribe$)
      .filter(r => r)
      .do(() => {
        this.setProviderCardStatus('github', 'loadingAuth');
      })
      .delay(3000)
      .switchMap(() =>
        this._cacheService.post(Constants.serviceHost + 'api/github/passthrough', true, null, {
          url: 'https://api.github.com/user',
          authToken: this._wizardService.getToken(),
        })
      )
      .subscribe(
        r => {
          const headersJson = r.headers.toJSON();
          const enableGitHubAction =
            this._scenarioService.checkScenario(ScenarioIds.enableGitHubAction, { site: this._wizardService.siteArm }).status === 'enabled';

          this._wizardService.isGithubActionWorkflowScopeAvailable =
            headersJson &&
            headersJson['x-oauth-scopes'] &&
            headersJson['x-oauth-scopes'].filter((scope: string) => scope.toLowerCase() === 'workflow').length > 0;

          this._wizardService.gitHubTokenUpdated$.next(true);

          if (enableGitHubAction && !this._wizardService.isGithubActionWorkflowScopeAvailable) {
            this.setProviderCardStatus('github', 'notAuthorized');
          } else {
            this.setProviderCardStatus('github', 'authorized', r.json().login);
          }
        },
        err => {
          this.setProviderCardStatus('github', 'notAuthorized');
          this._logService.error(LogCategories.cicd, '/fetch-github-user', err);
        }
      );

    this.bitbucketUserSubject$
      .takeUntil(this._ngUnsubscribe$)
      .filter(r => r)
      .do(() => {
        this.setProviderCardStatus('bitbucket', 'loadingAuth');
      })
      .delay(3000)
      .switchMap(() =>
        this._cacheService.post(Constants.serviceHost + 'api/bitbucket/passthrough', true, null, {
          url: 'https://api.bitbucket.org/2.0/user',
          authToken: this._wizardService.getToken(),
        })
      )
      .subscribe(
        r => {
          this.setProviderCardStatus('bitbucket', 'authorized', r.json().display_name);
        },
        err => {
          this.setProviderCardStatus('bitbucket', 'notAuthorized');
          this._logService.error(LogCategories.cicd, '/fetch-bitbucket-user', err);
        }
      );

    this.onedriveUserSubject$
      .takeUntil(this._ngUnsubscribe$)
      .filter(r => r)
      .do(() => {
        this.setProviderCardStatus('onedrive', 'loadingAuth');
      })

      .delay(3000)
      .switchMap(() =>
        this._cacheService.post(Constants.serviceHost + 'api/onedrive/passthrough', true, null, {
          url: 'https://api.onedrive.com/v1.0/drive',
          authToken: this._wizardService.getToken(),
        })
      )
      .subscribe(
        r => {
          this.setProviderCardStatus('onedrive', 'authorized', r.json().owner.user.displayName);
        },
        err => {
          this.setProviderCardStatus('onedrive', 'notAuthorized');
          this._logService.error(LogCategories.cicd, '/fetch-onedrive-user', err);
        }
      );

    this.dropboxUserSubject$
      .takeUntil(this._ngUnsubscribe$)
      .filter(r => r)
      .do(() => {
        this.setProviderCardStatus('dropbox', 'loadingAuth');
      })
      .delay(3000)
      .switchMap(() =>
        this._cacheService.post(Constants.serviceHost + 'api/dropbox/passthrough', true, null, {
          url: 'https://api.dropboxapi.com/2/users/get_current_account',
          authToken: this._wizardService.getToken(),
        })
      )
      .subscribe(
        r => {
          this.setProviderCardStatus('dropbox', 'authorized', r.json().name.display_name);
        },
        err => {
          this.setProviderCardStatus('dropbox', 'notAuthorized');
          this._logService.error(LogCategories.cicd, '/fetch-dropbox-user', err);
        }
      );

    if (this._shouldFetchSourceControlTokens()) {
      this._wizardService.resourceIdStream$
        .takeUntil(this._ngUnsubscribe$)
        .switchMap(r =>
          this._cacheService.post(Constants.serviceHost + 'api/SourceControlAuthenticationState', true, null, {
            authToken: this._wizardService.getToken(),
          })
        )
        .subscribe(
          dep => {
            const r = dep.json();
            this._onedriveAuthed = r.onedrive;
            this._dropboxAuthed = r.dropbox;
            this._bitbucketAuthed = r.bitbucket;
            this._githubAuthed = r.github;
            this.refreshAuth();
          },
          err => {
            this.authStateError = true;
            this._logService.error(LogCategories.cicd, '/fetch-current-auth-state', err);
          }
        );
    }

    this._wizardService.siteArmObj$.subscribe(SiteObj => {
      if (SiteObj) {
        this._allProviders.forEach(provider => {
          provider.enabled = this._scenarioService.checkScenario(provider.scenarioId, { site: SiteObj }).status !== 'disabled';
          if (provider.enabled) {
            if (provider.deploymentType === 'continuous') {
              this.continuousDeploymentProviderCards.push(provider);
            } else {
              this.manualDeploymentProviderCards.push(provider);
            }
          }
        });
        this.refreshAuth();
      }
    });
  }

  private _shouldFetchSourceControlTokens(): boolean {
    // NOTE(michinoy): Only attempt to fetch the source control token if at least one source control provider
    // is supported.
    const oneDriveSourceScenario = this._scenarioService.checkScenario(ScenarioIds.onedriveSource);
    const dropboxSourceScenario = this._scenarioService.checkScenario(ScenarioIds.dropboxSource);
    const gitHubSourceScenario = this._scenarioService.checkScenario(ScenarioIds.githubSource);
    const bitBucketSourceScenario = this._scenarioService.checkScenario(ScenarioIds.bitbucketSource);
    const vstsSourceScenario = this._scenarioService.checkScenario(ScenarioIds.vstsSource);

    return (
      oneDriveSourceScenario.status !== 'disabled' ||
      dropboxSourceScenario.status !== 'disabled' ||
      gitHubSourceScenario.status !== 'disabled' ||
      bitBucketSourceScenario.status !== 'disabled' ||
      vstsSourceScenario.status !== 'disabled'
    );
  }

  public refreshAuth() {
    if (this._onedriveAuthed) {
      this.onedriveUserSubject$.next(this._onedriveAuthed);
    } else {
      this.setProviderCardStatus('onedrive', 'notAuthorized');
    }

    if (this._dropboxAuthed) {
      this.dropboxUserSubject$.next(this._dropboxAuthed);
    } else {
      this.setProviderCardStatus('dropbox', 'notAuthorized');
    }

    if (this._githubAuthed) {
      this.githubUserSubject$.next(this._githubAuthed);
    } else {
      this.setProviderCardStatus('github', 'notAuthorized');
    }

    if (this._bitbucketAuthed) {
      this.bitbucketUserSubject$.next(this._bitbucketAuthed);
    } else {
      this.setProviderCardStatus('bitbucket', 'notAuthorized');
    }
  }

  private setProviderCardStatus(id: string, status: 'loadingAuth' | 'notAuthorized' | 'authorized' | 'none', userId: string = '') {
    const continuousDeploymentCard = this.continuousDeploymentProviderCards.find(x => x.id === id);
    if (continuousDeploymentCard) {
      continuousDeploymentCard.authorizedStatus = status;
      continuousDeploymentCard.authenticatedId = userId;
    }

    const manualDeploymentCard = this.manualDeploymentProviderCards.find(x => x.id === id);
    if (manualDeploymentCard) {
      manualDeploymentCard.authorizedStatus = status;
      manualDeploymentCard.authenticatedId = userId;
    }
  }
  public selectProvider(card: ProviderCard) {
    this._logService.trace(LogCategories.cicd, '/source-provider-card-selected', card);
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
      this._dropboxAuthed = true;
      this.dropboxUserSubject$.next(true);
    } else if (provider === 'github') {
      this._githubAuthed = true;
      this.githubUserSubject$.next(true);
    } else if (provider === 'onedrive') {
      this._onedriveAuthed = true;
      this.onedriveUserSubject$.next(true);
    } else if (provider === 'bitbucket') {
      this._bitbucketAuthed = true;
      this.bitbucketUserSubject$.next(true);
    }
    this._wizardService.updateSourceProviderConfig$.next();
  }
  public authorize() {
    this._logService.trace(LogCategories.cicd, '/source-provider-authorize', this.selectedProvider);
    const provider = this.selectedProvider.id;
    const win = window.open(`${Constants.serviceHost}auth/${provider}/authorize`, 'windowname1', 'width=800, height=600');
    const clearInterval = new Subject();
    Observable.timer(100, 100)
      .takeUntil(this._ngUnsubscribe$)
      .takeUntil(clearInterval)
      .subscribe(() => {
        try {
          if (win.closed) {
            clearInterval.next();
          } else if (win.document.URL.indexOf(`/callback`) !== -1) {
            clearInterval.next();

            this._cacheService
              .post(`${Constants.serviceHost}auth/${provider}/storeToken`, true, null, {
                redirUrl: win.document.URL,
                authToken: this._wizardService.getToken(),
              })
              .subscribe(() => {
                this.updateProvider(provider);
                win.close();
              });
          }
        } catch (e) {
          if (!(e instanceof DOMException)) {
            // NOTE(michinoy): While we wait and retry for authorization window to switch to callback, local DOM Exception
            // will be thrown indicating cross site origin. Do not log those as it will skew the actual error report.
            this._logService.error(LogCategories.cicd, `/authorize/${provider}`, e);
          }
        }
      });
  }

  onKeyPress(event: KeyboardEvent, card: ProviderCard) {
    if (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space) {
      this.selectProvider(card);
    }
  }
}
