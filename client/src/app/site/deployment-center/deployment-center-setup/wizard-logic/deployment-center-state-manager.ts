import { ReplaySubject } from 'rxjs/ReplaySubject';
import { FormGroup, FormControl } from '@angular/forms';
import { WizardForm, SourceSettings } from './deployment-center-setup-models';
import { Observable } from 'rxjs/Observable';
import { CacheService } from '../../../../shared/services/cache.service';
import { ArmSiteDescriptor } from '../../../../shared/resourceDescriptors';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { UserService } from '../../../../shared/services/user.service';
import {
  ARMApiVersions,
  ScenarioIds,
  Kinds,
  RuntimeStacks,
  Constants,
  JavaVersions,
  JavaContainers,
  DeploymentCenterConstants,
  LogCategories,
} from '../../../../shared/models/constants';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { ArmObj } from '../../../../shared/models/arm/arm-obj';
import { Site } from '../../../../shared/models/arm/site';
import { SiteService } from '../../../../shared/services/site.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ScenarioService } from '../../../../shared/services/scenario/scenario.service';
import { VSOAccount } from '../../Models/vso-repo';
import { AzureDevOpsService } from './azure-devops.service';
import { GithubService } from './github.service';
import { GitHubActionWorkflowRequestContent, GitHubCommit } from '../../Models/github';
import { Guid } from 'app/shared/Utilities/Guid';
import { SubscriptionService } from 'app/shared/services/subscription.service';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { WorkflowOptions } from '../../Models/deployment-enums';
import { BehaviorSubject } from 'rxjs';
import { LogService } from '../../../../shared/services/log.service';
import { PublishingCredentials } from '../../../../shared/models/publishing-credentials';
import { HttpResult } from '../../../../shared/models/http-result';

@Injectable()
export class DeploymentCenterStateManager implements OnDestroy {
  public resourceIdStream$ = new ReplaySubject<string>(1);
  public wizardForm: FormGroup = new FormGroup({});
  private _resourceId = '';
  private _ngUnsubscribe$ = new Subject();
  private _token: string;
  public siteArm: ArmObj<Site>;
  public siteArmObj$ = new ReplaySubject<ArmObj<Site>>();
  public updateSourceProviderConfig$ = new Subject();
  public selectedVstsRepoId = '';
  public subscriptionName = '';
  public canCreateNewSite = true;
  public hideBuild = false;
  public hideVstsBuildConfigure = false;
  public isLinuxApp = false;
  public isFunctionApp = false;
  public vstsKuduOnly = false;
  public vsoAccounts: VSOAccount[] = [];
  public hideConfigureStepContinueButton = false;
  public siteName = '';
  public slotName = '';
  public gitHubPublishProfileSecretGuid = '';
  public isGithubActionWorkflowScopeAvailable = false;
  public stack = '';
  public stackVersion = '';
  public gitHubTokenUpdated$ = new ReplaySubject<boolean>();
  public bitBucketToken$ = new BehaviorSubject<string>('');
  public gitHubToken$ = new BehaviorSubject<string>('');
  public replacementPublishUrl = '';

  constructor(
    private _cacheService: CacheService,
    private _azureDevOpsService: AzureDevOpsService,
    private _translateService: TranslateService,
    private _scenarioService: ScenarioService,
    private _githubService: GithubService,
    private _logService: LogService,
    private _siteService: SiteService,
    userService: UserService,
    subscriptionService: SubscriptionService
  ) {
    this.resourceIdStream$
      .switchMap(r => {
        this._resourceId = r;
        const siteDescriptor = new ArmSiteDescriptor(this._resourceId);
        this.siteName = siteDescriptor.site;
        this.slotName = siteDescriptor.slot;

        // TODO (michinoy): Figure out a way to only generate this guid IF github actions build provider
        // is selected. This might require refactoring a ton of stuff in step-complete component to understand
        // what build provider is selected.
        this.gitHubPublishProfileSecretGuid = Guid.newGuid()
          .toLowerCase()
          .replace(/[-]/g, '');

        return forkJoin(
          this._siteService.getSite(this._resourceId),
          this._siteService.getSiteConfig(this._resourceId),
          this._siteService.getAppSettings(this._resourceId),
          this._siteService.fetchSiteConfigMetadata(this._resourceId),
          this._siteService.getPublishingCredentials(this._resourceId),
          subscriptionService.getSubscription(siteDescriptor.subscription)
        );
      })
      .switchMap(result => {
        const [site, config, appSettings, configMetadata, publishingCredentials, sub] = result;
        this.siteArm = site.result;
        this.isLinuxApp = this.siteArm.kind.toLowerCase().includes(Kinds.linux);
        this.isFunctionApp = this.siteArm.kind.toLowerCase().includes(Kinds.functionApp);
        this.subscriptionName = sub.result.displayName;

        // NOTE(michinoy): temporary fix, while the backend reinstates the scm url in the publish url property.
        this.replacementPublishUrl = this.isLinuxApp ? this._getScmUri(publishingCredentials) : null;

        if (config.isSuccessful && appSettings.isSuccessful && configMetadata.isSuccessful) {
          this._setStackAndVersion(config.result.properties, appSettings.result.properties, configMetadata.result.properties);
        }

        this.siteArmObj$.next(this.siteArm);

        return this._scenarioService.checkScenarioAsync(ScenarioIds.vstsDeploymentHide, { site: this.siteArm });
      })
      .subscribe(vstsScenarioCheck => {
        this.hideBuild = vstsScenarioCheck.status === 'disabled';
      });

    userService
      .getStartupInfo()
      .takeUntil(this._ngUnsubscribe$)
      .subscribe(r => {
        this._token = r.token;
      });
  }

  public get wizardValues(): WizardForm {
    return this.wizardForm.value;
  }

  public set wizardValues(values: WizardForm) {
    this.wizardForm.patchValue(values);
  }
  public get sourceSettings(): FormGroup {
    return (this.wizardForm && (this.wizardForm.controls.sourceSettings as FormGroup)) || null;
  }

  public get buildSettings(): FormGroup {
    return (this.wizardForm && (this.wizardForm.controls.buildSettings as FormGroup)) || null;
  }

  public deploy(): Observable<{ status: string; statusMessage: string; result: any }> {
    switch (this.wizardValues.buildProvider) {
      case 'github':
        // NOTE(michinoy): Only initiate writing a workflow configuration file if the branch does not already have it OR
        // the user opted to overwrite it.
        if (
          !this.wizardValues.sourceSettings.githubActionWorkflowOption ||
          this.wizardValues.sourceSettings.githubActionWorkflowOption === WorkflowOptions.Overwrite
        ) {
          return this._deployGithubActions().map(result => ({ status: 'succeeded', statusMessage: null, result }));
        } else {
          return this._deployKudu().map(result => ({ status: 'succeeded', statusMessage: null, result }));
        }
      default:
        return this._deployKudu().map(result => ({ status: 'succeeded', statusMessage: null, result }));
    }
  }

  public fetchVSTSProfile() {
    // if the first get fails, it's likely because the user doesn't have an account in vsts yet
    // the fix for this is to do an empty post call on the same url and then get it
    return this._cacheService
      .get(AzureDevOpsService.AzDevProfileUri, true, this._azureDevOpsService.getAzDevDirectHeaders(false))
      .catch(() => {
        return this._cacheService
          .post(AzureDevOpsService.AzDevProfileUri, true, this._azureDevOpsService.getAzDevDirectHeaders(false))
          .switchMap(() => {
            return this._cacheService.get(AzureDevOpsService.AzDevProfileUri, true, this._azureDevOpsService.getAzDevDirectHeaders(false));
          });
      });
  }

  private _setStackAndVersion(
    siteConfig: SiteConfig,
    siteAppSettings: { [key: string]: string },
    configMetadata: { [key: string]: string }
  ) {
    if (this.isLinuxApp) {
      this._setStackAndVersionForLinux(siteConfig);
    } else {
      this._setStackAndVersionForWindows(siteConfig, siteAppSettings, configMetadata);
    }
  }

  private _setStackAndVersionForWindows(
    siteConfig: SiteConfig,
    siteAppSettings: { [key: string]: string },
    configMetadata: { [key: string]: string }
  ) {
    if (configMetadata['CURRENT_STACK']) {
      const metadataStack = configMetadata['CURRENT_STACK'].toLowerCase();

      // NOTE(michinoy): Java is special, so need to handle it carefully. Also in this case, use
      // the string 'java' rather than any of the constants defined as it is not related to any of the
      // defined constants.
      if (metadataStack === 'java') {
        this.stack = siteConfig.javaVersion === JavaVersions.WindowsVersion8 ? RuntimeStacks.java8 : RuntimeStacks.java11;
      } else if (metadataStack === 'dotnet') {
        this.stack = RuntimeStacks.aspnet;
      } else {
        this.stack = metadataStack;
      }
    }

    if (this.stack === RuntimeStacks.node) {
      this.stackVersion = siteAppSettings[Constants.nodeVersionAppSettingName];
    } else if (this.stack === RuntimeStacks.python) {
      this.stackVersion = siteConfig.pythonVersion;
    } else if (this.stack === RuntimeStacks.java8 || this.stack === RuntimeStacks.java11) {
      this.stackVersion = `${siteConfig.javaVersion}|${siteConfig.javaContainer}|${siteConfig.javaContainerVersion}`;
    } else if (this.stack === RuntimeStacks.aspnet && !!siteConfig.netFrameworkVersion) {
      this.stackVersion == siteConfig.netFrameworkVersion;
    } else if (this.stack === '') {
      this.stackVersion = '';
    }
  }

  private _setStackAndVersionForLinux(siteConfig: SiteConfig) {
    const linuxFxVersionParts = siteConfig.linuxFxVersion ? siteConfig.linuxFxVersion.split('|') : [];
    const runtimeStack = linuxFxVersionParts.length > 0 ? linuxFxVersionParts[0].toLocaleLowerCase() : '';

    // NOTE(michinoy): Java is special, so need to handle it carefully.
    if (runtimeStack === JavaContainers.JavaSE || runtimeStack === JavaContainers.Tomcat) {
      const fxVersionParts = !!siteConfig.linuxFxVersion ? siteConfig.linuxFxVersion.split('-') : [];
      const fxStack = fxVersionParts.length === 2 ? fxVersionParts[1].toLocaleLowerCase() : '';
      if (fxStack === JavaVersions.LinuxVersion8 || fxStack === JavaVersions.LinuxVersion11) {
        this.stack = fxStack === JavaVersions.LinuxVersion8 ? RuntimeStacks.java8 : RuntimeStacks.java11;
      } else {
        this.stack = '';
      }
    } else {
      // NOTE(michinoy): So it seems that in the stack API the stack value is 'aspnet', whereas from site config, the stack identifier is
      // 'dotnetcore'. Due to this mismatch, we need to hard code the conversion on the client side.
      this.stack = siteConfig.linuxFxVersion.toLocaleLowerCase() === 'dotnetcore|5.0' ? RuntimeStacks.aspnet : runtimeStack;
    }

    this.stackVersion = !!siteConfig.linuxFxVersion ? siteConfig.linuxFxVersion : '';
  }

  private _deployGithubActions() {
    const repo = this.wizardValues.sourceSettings.repoUrl.replace(`${DeploymentCenterConstants.githubUri}/`, '');
    const branch = this.wizardValues.sourceSettings.branch || 'master';
    const workflowInformation = this._githubService.getWorkflowInformation(
      this.wizardValues.buildSettings,
      this.wizardValues.sourceSettings,
      this.isLinuxApp,
      this.gitHubPublishProfileSecretGuid,
      this.siteName,
      this.slotName
    );

    const commitInfo: GitHubCommit = {
      repoName: repo,
      branchName: branch,
      filePath: `.github/workflows/${workflowInformation.fileName}`,
      message: this._translateService.instant(PortalResources.githubActionWorkflowCommitMessage),
      contentBase64Encoded: btoa(workflowInformation.content),
      committer: {
        name: 'Azure App Service',
        email: 'donotreply@microsoft.com',
      },
    };

    return this._githubService
      .fetchWorkflowConfiguration(this.gitHubToken$.getValue(), this.wizardValues.sourceSettings.repoUrl, repo, branch, commitInfo.filePath)
      .switchMap(fileContentResponse => {
        if (fileContentResponse) {
          commitInfo.sha = fileContentResponse.sha;
        }

        const requestContent: GitHubActionWorkflowRequestContent = {
          resourceId: this._resourceId,
          secretName: workflowInformation.secretName,
          commit: commitInfo,
        };

        return this._githubService.createOrUpdateActionWorkflow(
          this.getToken(),
          this.gitHubToken$.getValue(),
          requestContent,
          this.replacementPublishUrl
        );
      })
      .switchMap(_ => {
        return this._deployKudu();
      });
  }

  private _deployKudu() {
    const payload = this.wizardValues.sourceSettings;

    payload.isGitHubAction = this.wizardValues.buildProvider === 'github';
    payload.isManualIntegration = this.wizardValues.sourceProvider === 'external';

    if (this.wizardValues.sourceProvider === 'localgit') {
      return this._cacheService
        .patchArm(`${this._resourceId}/config/web`, ARMApiVersions.antaresApiVersion20181101, {
          properties: {
            scmType: 'LocalGit',
          },
        })
        .map(r => r.json());
    } else {
      return this._cacheService
        .putArm(`${this._resourceId}/sourcecontrols/web`, ARMApiVersions.antaresApiVersion20181101, {
          properties: payload,
        })
        .map(r => r.json())
        .catch((err, _) => {
          if (payload.isGitHubAction && this._isApiSyncError(err.json())) {
            // NOTE(michinoy): If the save operation was being done for GitHub Action, and
            // we are experiencing the API sync error, populate the source controls properties
            // manually.

            this._logService.error(LogCategories.cicd, 'apiSyncErrorWorkaround', { resourceId: this._resourceId });

            return this._updateGitHubActionSourceControlPropertiesManually(payload);
          } else {
            return Observable.throw(err);
          }
        });
    }
  }

  private _updateGitHubActionSourceControlPropertiesManually(sourceSettingsPayload: SourceSettings) {
    return this._fetchMetadata()
      .switchMap(r => {
        if (r && r.result && r.result.properties) {
          return this._updateMetadata(r.result.properties, sourceSettingsPayload);
        } else {
          return Observable.throw(r);
        }
      })
      .switchMap(r => {
        if (r && r.status === 200) {
          return this._patchSiteConfigForGitHubAction();
        } else {
          return Observable.throw(r);
        }
      })
      .catch(r => Observable.throw(r))
      .map(r => r.json());
  }

  private _updateMetadata(properties: { [key: string]: string }, sourceSettingsPayload: SourceSettings) {
    delete properties['RepoUrl'];
    delete properties['ScmUri'];
    delete properties['CloneUri'];
    delete properties['branch'];

    properties['RepoUrl'] = sourceSettingsPayload.repoUrl;
    properties['branch'] = sourceSettingsPayload.branch;

    return this._cacheService
      .putArm(`${this._resourceId}/config/metadata`, ARMApiVersions.antaresApiVersion20181101, { properties })
      .catch(err => {
        this._logService.error(LogCategories.cicd, 'apiSyncErrorWorkaround-update-metadata-failure', {
          resourceId: this._resourceId,
          error: err,
        });
        return Observable.throw(err);
      });
  }

  private _fetchMetadata() {
    return this._siteService.fetchSiteConfigMetadata(this._resourceId).catch(err => {
      this._logService.error(LogCategories.cicd, 'apiSyncErrorWorkaround-fetch-metadata-failure', {
        resourceId: this._resourceId,
        error: err,
      });
      return Observable.throw(err);
    });
  }

  private _patchSiteConfigForGitHubAction() {
    return this._cacheService
      .patchArm(`${this._resourceId}/config/web`, ARMApiVersions.antaresApiVersion20181101, {
        properties: {
          scmType: 'GitHubAction',
        },
      })
      .catch(err => {
        this._logService.error(LogCategories.cicd, 'apiSyncErrorWorkaround-sitConfig-patch-failure', {
          resourceId: this._resourceId,
          error: err,
        });
        return Observable.throw(err);
      });
  }

  // Detect the specific error which is indicative of Ant89 Geo/Stamp sync issues.
  private _isApiSyncError(error: any): boolean {
    return (
      error.Message &&
      error.Message.indexOf &&
      error.Message.indexOf('500 (InternalServerError)') > -1 &&
      error.Message.indexOf('GeoRegionServiceClient') > -1
    );
  }

  private _getScmUri(publishingCredentialsResponse: HttpResult<ArmObj<PublishingCredentials>>): string {
    if (
      publishingCredentialsResponse.isSuccessful &&
      publishingCredentialsResponse.result &&
      publishingCredentialsResponse.result.properties.scmUri
    ) {
      const scmUriParts = publishingCredentialsResponse.result.properties.scmUri.split('@');

      if (scmUriParts.length > 1) {
        return scmUriParts[1];
      }
    }

    return null;
  }

  public getToken(): string {
    return `Bearer ${this._token}`;
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }

  resetSection(formGroup: FormGroup) {
    formGroup.reset();
  }

  markSectionAsTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl && !control.touched && !control.dirty) {
        control.markAsTouched();
        control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      } else if (control instanceof FormGroup) {
        this.markSectionAsTouched(control);
      }
    });
  }
}
