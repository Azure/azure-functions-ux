import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Constants, KeyCodes, LogCategories, ScenarioIds } from 'app/shared/models/constants';
import { CacheService } from 'app/shared/services/cache.service';
import { LogService } from 'app/shared/services/log.service';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { BroadcastEvent } from '../../../../shared/models/broadcast-event';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { BroadcastService } from '../../../../shared/services/broadcast.service';
import { ProviderService } from '../../../../shared/services/provider.service';
import { ScenarioService } from '../../../../shared/services/scenario/scenario.service';
import { ProviderCard } from '../../Models/provider-card';

@Component({
  selector: 'app-step-source-control',
  templateUrl: './step-source-control.component.html',
  styleUrls: ['./step-source-control.component.scss', '../deployment-center-setup.component.scss'],
  providers: [ProviderService],
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
  private _bitbucketAuthed = false;

  continuousDeploymentProviderCards: ProviderCard[] = [];
  manualDeploymentProviderCards: ProviderCard[] = [];

  githubUserSubject$ = new Subject<boolean>();
  bitbucketUserSubject$ = new Subject<boolean>();

  public selectedProvider: ProviderCard = null;

  private _ngUnsubscribe$ = new Subject();

  constructor(
    private _wizardService: DeploymentCenterStateManager,
    private _cacheService: CacheService,
    private _logService: LogService,
    private _translateService: TranslateService,
    private _broadcastService: BroadcastService,
    private _scenarioService: ScenarioService,
    private _providerService: ProviderService
  ) {
    this._logService.trace(LogCategories.cicd, '/load-source-selector');

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
      }
    });

    this._setupProviderUserSubscribers();

    if (this._shouldFetchSourceControlTokens()) {
      this._setupProviderTokenSubscribers();
    }
  }

  private _setupProviderUserSubscribers() {
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
          gitHubToken: this._wizardService.gitHubToken$.getValue(),
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
          bitBucketToken: this._wizardService.bitBucketToken$.getValue(),
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
  }

  private _setupProviderTokenSubscribers() {
    this._wizardService.siteArmObj$
      .takeUntil(this._ngUnsubscribe$)
      .switchMap(r => this._providerService.getUserSourceControls())
      .subscribe(
        response => {
          if (response.isSuccessful) {
            const bitBucketSourceControl = response.result.value.find(item => item.name.toLocaleLowerCase() == 'bitbucket');
            const gitHubSourceControl = response.result.value.find(item => item.name.toLocaleLowerCase() == 'github');

            this._wizardService.bitBucketToken$.next(bitBucketSourceControl && bitBucketSourceControl.properties.token);
            this._wizardService.gitHubToken$.next(gitHubSourceControl && gitHubSourceControl.properties.token);
          } else {
            this.authStateError = true;
            this._logService.error(LogCategories.cicd, '/fetch-current-auth-state', response.error);
          }
        },
        err => {
          this.authStateError = true;
          this._logService.error(LogCategories.cicd, '/fetch-current-auth-state', err);
        }
      );

    this._wizardService.bitBucketToken$
      .takeUntil(this._ngUnsubscribe$)
      .distinctUntilChanged()
      .subscribe(token => {
        this._bitbucketAuthed = !!token;

        if (this._bitbucketAuthed) {
          this.bitbucketUserSubject$.next(this._bitbucketAuthed);
        } else {
          this.setProviderCardStatus('bitbucket', 'notAuthorized');
        }
      });

    this._wizardService.gitHubToken$
      .takeUntil(this._ngUnsubscribe$)
      .distinctUntilChanged()
      .subscribe(token => {
        this._githubAuthed = !!token;

        if (this._githubAuthed) {
          this.githubUserSubject$.next(this._githubAuthed);
        } else {
          this.setProviderCardStatus('github', 'notAuthorized');
        }
      });
  }

  private _shouldFetchSourceControlTokens(): boolean {
    // NOTE(michinoy): Only attempt to fetch the source control token if at least one source control provider
    // is supported.
    const gitHubSourceScenario = this._scenarioService.checkScenario(ScenarioIds.githubSource);
    const bitBucketSourceScenario = this._scenarioService.checkScenario(ScenarioIds.bitbucketSource);
    const vstsSourceScenario = this._scenarioService.checkScenario(ScenarioIds.vstsSource);

    return (
      gitHubSourceScenario.status !== 'disabled' ||
      bitBucketSourceScenario.status !== 'disabled' ||
      vstsSourceScenario.status !== 'disabled'
    );
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
    if (provider === 'github') {
      this._githubAuthed = true;
      this.githubUserSubject$.next(true);
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
              .post(`${Constants.serviceHost}auth/${provider}/getToken`, true, null, {
                redirUrl: win.document.URL,
              })
              .switchMap(response => {
                if (response && response.status === 200 && response.json()) {
                  const responseJson = response.json();

                  switch (provider) {
                    case 'bitbucket':
                      this._wizardService.bitBucketToken$.next(responseJson.accessToken);
                      break;
                    case 'github':
                      this._wizardService.gitHubToken$.next(responseJson.accessToken);
                      break;
                    default:
                      // NOTE(michinoy): Do nothing in this case as the POST call above would have failed.
                      break;
                  }

                  return this._providerService.updateUserSourceControl(
                    provider,
                    responseJson.accessToken,
                    responseJson.refreshToken,
                    responseJson.environment
                  );
                } else {
                  return Observable.of(null);
                }
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
