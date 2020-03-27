import { ReplaySubject } from 'rxjs/ReplaySubject';
import { FormGroup, FormControl } from '@angular/forms';
import {
  WizardForm,
  PermissionsResultCreationParameters,
  PermissionsResult,
  ProvisioningConfigurationV2,
} from './deployment-center-setup-models';
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
} from '../../../../shared/models/constants';
import { parseToken } from '../../../../pickers/microsoft-graph/microsoft-graph-helper';
import { PortalService } from '../../../../shared/services/portal.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { ArmObj } from '../../../../shared/models/arm/arm-obj';
import { Site } from '../../../../shared/models/arm/site';
import { SiteService } from '../../../../shared/services/site.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ScenarioService } from '../../../../shared/services/scenario/scenario.service';
import { VSOAccount } from '../../Models/vso-repo';
import { AzureDevOpsService, AzureDevOpsDeploymentMethod, TargetAzDevDeployment } from './azure-devops.service';
import { LocalStorageService } from '../../../../shared/services/local-storage.service';
import { GithubService } from './github.service';
import { GitHubActionWorkflowRequestContent, GitHubCommit } from '../../Models/github';
import { Guid } from 'app/shared/Utilities/Guid';
import { SubscriptionService } from 'app/shared/services/subscription.service';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { WorkflowOptions } from '../../Models/deployment-enums';

const CreateAadAppPermissionStorageKey = 'DeploymentCenterSessionCanCreateAadApp';

@Injectable()
export class DeploymentCenterStateManager implements OnDestroy {
  public resourceIdStream$ = new ReplaySubject<string>(1);
  public wizardForm: FormGroup = new FormGroup({});
  private _resourceId = '';
  private _ngUnsubscribe$ = new Subject();
  private _token: string;
  private _vstsApiToken: string;
  private _sessionId: string;
  private _azureDevOpsDeploymentMethod: AzureDevOpsDeploymentMethod = AzureDevOpsDeploymentMethod.UseV1Api;
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

  constructor(
    private _cacheService: CacheService,
    private _azureDevOpsService: AzureDevOpsService,
    private _translateService: TranslateService,
    private _localStorageService: LocalStorageService,
    private _portalService: PortalService,
    private _scenarioService: ScenarioService,
    private _githubService: GithubService,
    siteService: SiteService,
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
          siteService.getSite(this._resourceId),
          siteService.getSiteConfig(this._resourceId),
          siteService.getAppSettings(this._resourceId),
          siteService.fetchSiteConfigMetadata(this._resourceId),
          subscriptionService.getSubscription(siteDescriptor.subscription)
        );
      })
      .switchMap(result => {
        const [site, config, appSettings, configMetadata, sub] = result;
        this.siteArm = site.result;
        this.isLinuxApp = this.siteArm.kind.toLowerCase().includes(Kinds.linux);
        this.isFunctionApp = this.siteArm.kind.toLowerCase().includes(Kinds.functionApp);
        this.subscriptionName = sub.result.displayName;

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
        this._sessionId = r.sessionId;
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
      case 'vsts':
        return this._deployVsts();
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
      this.stack = runtimeStack;
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
      .fetchWorkflowConfiguration(this.getToken(), this.wizardValues.sourceSettings.repoUrl, repo, branch, commitInfo.filePath)
      .switchMap(fileContentResponse => {
        if (fileContentResponse) {
          commitInfo.sha = fileContentResponse.sha;
        }

        const requestContent: GitHubActionWorkflowRequestContent = {
          resourceId: this._resourceId,
          secretName: workflowInformation.secretName,
          commit: commitInfo,
        };

        return this._githubService.createOrUpdateActionWorkflow(this.getToken(), requestContent);
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
        .map(r => r.json());
    }
  }

  private _deployVsts() {
    return this._getVstsToken()
      .switchMap(r => {
        if (r.status !== 'succeeded') {
          return Observable.of(r);
        }
        this._vstsApiToken = r.result;
        return this._azureDevOpsService.getAzureDevOpsDeploymentMethod(this.siteArm);
      })
      .switchMap(r => {
        this._azureDevOpsDeploymentMethod = r.result;
        if (
          this._azureDevOpsDeploymentMethod === AzureDevOpsDeploymentMethod.UsePublishProfile ||
          AzureDevOpsService.TargetAzDevDeployment === TargetAzDevDeployment.Devfabric
        ) {
          return Observable.of({
            status: 'succeeded',
            statusMessage: null,
            result: null,
          });
        } else {
          return this._canCreateAadApp();
        }
      })
      .switchMap(r => {
        if (r.status !== 'succeeded') {
          return Observable.of(r);
        }

        return this._startVstsDeployment().concatMap(id => {
          return Observable.timer(1000, 1000)
            .switchMap(() => this._pollVstsCheck(id))
            .map(r => {
              const result = r.json();
              const ciConfig: { status: string; statusMessage: string } = result.ciConfiguration.result;
              return { ...ciConfig, result: result.ciConfiguration };
            })
            .first(result => {
              return result.status !== 'inProgress' && result.status !== 'queued';
            });
        });
      });
  }

  private _pollVstsCheck(id: string) {
    return this._azureDevOpsService.getAccounts().switchMap(r => {
      const appendMsaPassthroughHeader = r.find(
        x => x.AccountName.toLowerCase() === this.wizardValues.buildSettings.vstsAccount.toLowerCase()
      )!.ForceMsaPassThrough;

      return this._cacheService.get(
        `${AzureDevOpsService.AzureDevOpsUrl.PeCollectionLevel.format(
          this.wizardValues.buildSettings.vstsAccount
        )}_apis/ContinuousDelivery/ProvisioningConfigurations/${id}?api-version=3.2-preview.1`,
        true,
        this._azureDevOpsService.getAzDevDirectHeaders(appendMsaPassthroughHeader)
      );
    });
  }

  private _startVstsDeployment() {
    if (this.wizardValues.sourceProvider === 'vsts') {
      this.wizardValues.sourceSettings.repoUrl = this.selectedVstsRepoId;
    }
    const deploymentObject = this._azureDevOpsService.getAzureDevOpsProvisioningConfiguration(
      this.wizardValues,
      this.siteArm,
      this.subscriptionName,
      this._vstsApiToken,
      this._azureDevOpsDeploymentMethod
    );

    this._portalService.logAction('deploymentcenter', 'azureDevOpsDeployment', {
      buildProvider: this.wizardValues.buildProvider,
      sourceProvider: this.wizardValues.sourceProvider,
      pipelineTemplateId: !!(<ProvisioningConfigurationV2>deploymentObject).pipelineTemplateId
        ? (<ProvisioningConfigurationV2>deploymentObject).pipelineTemplateId
        : '',
      azureDevOpsDeploymentMethod: AzureDevOpsDeploymentMethod[this._azureDevOpsDeploymentMethod],
    });

    const setupvsoCall = this._azureDevOpsService.startDeployment(
      this.wizardValues.buildSettings.vstsAccount,
      deploymentObject,
      this.wizardValues.buildSettings.createNewVsoAccount
    );

    if (this.wizardValues.buildSettings.createNewVsoAccount) {
      return this._cacheService
        .post(
          `${AzureDevOpsService.AzureDevOpsUrl.Aex}_apis/HostAcquisition/collections?collectionName=${
            this.wizardValues.buildSettings.vstsAccount
          }&preferredRegion=${this.wizardValues.buildSettings.location}&api-version=4.0-preview.1`,
          true,
          this._azureDevOpsService.getAzDevDirectHeaders(false),
          {
            'VisualStudio.Services.HostResolution.UseCodexDomainForHostCreation': true,
          }
        )
        .switchMap(() => setupvsoCall)
        .switchMap(r => Observable.of(r.id));
    }
    return setupvsoCall.switchMap(r => {
      return Observable.of(r.id);
    });
  }

  private _canCreateAadApp(): Observable<{ status: string; statusMessage: string; result: any }> {
    const success = {
      status: 'succeeded',
      statusMessage: null,
      result: null,
    };

    const permissionPayload: PermissionsResultCreationParameters = {
      aadPermissions: {
        token: this._vstsApiToken,
        tenantId: parseToken(this._token).tid,
      },
    };

    if (!this._isAadCreatePermissionStored()) {
      return this._azureDevOpsService.getPermissionResult(permissionPayload).map((r: PermissionsResult) => {
        if (!r.aadPermissions.value) {
          return {
            status: 'failed',
            statusMessage: this._translateService.instant(PortalResources.noPermissionsToCreateApp).format(r.aadPermissions.message),
            result: null,
          };
        } else {
          this._storeAadCreatePermission();
          return success;
        }
      });
    } else {
      return Observable.of(success);
    }
  }

  private _isAadCreatePermissionStored(): boolean {
    let storedPermissionItem = <any>this._localStorageService.getItem(CreateAadAppPermissionStorageKey);
    if (storedPermissionItem && storedPermissionItem.sessionId && storedPermissionItem.sessionId === this._sessionId) {
      return true;
    }

    return false;
  }

  // Using Local storage for two reasons:
  // 1. CacheService only caches for 1 minute which is too short for this scenario
  // 2. Local variable can not be used as Deployment center angular components are re-instantiated if we move out
  //    of Deployment center menu (say to Overview menu) and come back
  // There are two options to use as pivot for storing permission
  // 1. User token - this get auto refreshed every 60 minutes, hence stored value gets stale. Also this might be insecure.
  // 2. Session Id - this changes if user does page refresh or changes login
  // Choosing 2 as it seems longer-lived and is secure
  private _storeAadCreatePermission(): void {
    let storedPermissionItem = {
      id: CreateAadAppPermissionStorageKey,
      sessionId: this._sessionId,
    };

    // overwrite existing value
    this._localStorageService.setItem(storedPermissionItem.id, storedPermissionItem);
  }

  private _getVstsToken(): Observable<{ status: string; statusMessage: string; result: any }> {
    return this._portalService
      .getAdToken('azureTfsApi')
      .first()
      .switchMap(tokenData => {
        if (!tokenData || !tokenData.result || !tokenData.result.token || !parseToken(tokenData.result.token)) {
          return Observable.of({
            status: 'failed',
            statusMessage: this._translateService.instant(PortalResources.vstsTokenIsInvalid),
            result: null,
          });
        } else {
          return Observable.of({
            status: 'succeeded',
            statusMessage: null,
            result: tokenData.result.token,
          });
        }
      })
      .catch(error => {
        return Observable.of({
          status: 'failed',
          statusMessage: this._translateService.instant(PortalResources.vstsTokenFetchFailed).format(JSON.stringify(error)),
          result: null,
        });
      });
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
