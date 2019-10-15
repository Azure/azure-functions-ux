import { ReplaySubject } from 'rxjs/ReplaySubject';
import { FormGroup, FormControl } from '@angular/forms';
import {
  WizardForm,
  ProvisioningConfiguration,
  CiConfiguration,
  DeploymentTarget,
  DeploymentSourceType,
  CodeRepositoryDeploymentSource,
  ApplicationType,
  DeploymentTargetProvider,
  AzureAppServiceDeploymentTarget,
  AzureResourceType,
  TargetEnvironmentType,
  CodeRepository,
  BuildConfiguration,
  PythonFrameworkType,
  PermissionsResultCreationParameters,
  PermissionsResult,
  ProvisioningConfigurationBase,
  ProvisioningConfigurationV2,
} from './deployment-center-setup-models';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';
import { CacheService } from '../../../../shared/services/cache.service';
import { ArmSiteDescriptor } from '../../../../shared/resourceDescriptors';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { UserService } from '../../../../shared/services/user.service';
import { ARMApiVersions, ScenarioIds, DeploymentCenterConstants, Kinds, FeatureFlags } from '../../../../shared/models/constants';
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
import { AzureDevOpsService } from './azure-devops.service';
import { LocalStorageService } from '../../../../shared/services/local-storage.service';
import { Url } from 'app/shared/Utilities/url';

const CreateAadAppPermissionStorageKey = 'DeploymentCenterSessionCanCreateAadApp';
const IsPublishProfileBasedDeploymentEnabled = Url.getFeatureValue(FeatureFlags.enablePublishProfileBasedDeployment);

@Injectable()
export class DeploymentCenterStateManager implements OnDestroy {
  public resourceIdStream$ = new ReplaySubject<string>(1);
  public wizardForm: FormGroup = new FormGroup({});
  private _resourceId = '';
  private _location = '';
  private _ngUnsubscribe$ = new Subject();
  private _token: string;
  private _vstsApiToken: string;
  private _sessionId: string;
  private _shouldUsePublishProfile = false;
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
  public isWindowsApp = false;
  public vstsKuduOnly = false;
  public vsoAccounts: VSOAccount[] = [];
  public hideConfigureStepContinueButton = false;

  constructor(
    private _cacheService: CacheService,
    private _azureDevOpsService: AzureDevOpsService,
    private _translateService: TranslateService,
    private _localStorageService: LocalStorageService,
    private _portalService: PortalService,
    private _scenarioService: ScenarioService,
    siteService: SiteService,
    userService: UserService
  ) {
    this.resourceIdStream$
      .switchMap(r => {
        this._resourceId = r;
        const siteDescriptor = new ArmSiteDescriptor(this._resourceId);
        return forkJoin(
          siteService.getSite(this._resourceId),
          this._cacheService.getArm(`/subscriptions/${siteDescriptor.subscription}`, false, ARMApiVersions.armApiVersion)
        );
      })
      .switchMap(result => {
        const [site, sub] = result;
        this.siteArm = site.result;
        this.isLinuxApp = this.siteArm.kind.toLowerCase().includes(Kinds.linux);
        this.isFunctionApp = this.siteArm.kind.toLowerCase().includes(Kinds.functionApp);
        this.isWindowsApp = this.siteArm.kind.toLowerCase() === Kinds.app;
        this.siteArmObj$.next(this.siteArm);
        this.subscriptionName = sub.json().displayName;
        this._location = this.siteArm.location;
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
      default:
        return this._deployKudu().map(result => ({ status: 'succeeded', statusMessage: null, result }));
    }
  }

  public fetchVSTSProfile() {
    // if the first get fails, it's likely because the user doesn't have an account in vsts yet
    // the fix for this is to do an empty post call on the same url and then get it
    return this._cacheService.get(DeploymentCenterConstants.vstsProfileUri, true, this.getVstsDirectHeaders(false)).catch(() => {
      return this._cacheService.post(DeploymentCenterConstants.vstsProfileUri, true, this.getVstsDirectHeaders(false)).switchMap(() => {
        return this._cacheService.get(DeploymentCenterConstants.vstsProfileUri, true, this.getVstsDirectHeaders(false));
      });
    });
  }

  private _deployKudu() {
    const payload = this.wizardValues.sourceSettings;
    if (this.wizardValues.sourceProvider === 'external') {
      payload.isManualIntegration = true;
    }

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
        return this.usePublishProfileToDeploy();
      })
      .switchMap(r => {
        this._shouldUsePublishProfile = r.result;
        if (this._shouldUsePublishProfile) {
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
        `https://${
          this.wizardValues.buildSettings.vstsAccount
        }.portalext.visualstudio.com/_apis/ContinuousDelivery/ProvisioningConfigurations/${id}?api-version=3.2-preview.1`,
        true,
        this.getVstsDirectHeaders(appendMsaPassthroughHeader)
      );
    });
  }

  private _startVstsDeployment() {
    let deploymentObject: ProvisioningConfigurationBase;

    if (this.usePipelineTemplateAPI()) {
      deploymentObject = {
        pipelineTemplateId: this.getPipelineTemplateId(),
        pipelineTemplateParameters: this.getPipelineTemplateParameters(),
        ciConfiguration: this._ciConfig,
        repository: this._repoInfo,
      } as ProvisioningConfigurationV2;
    } else {
      deploymentObject = {
        authToken: this.getToken(),
        ciConfiguration: this._ciConfig,
        id: null,
        source: this._deploymentSource,
        targets: this._deploymentTargets,
      } as ProvisioningConfiguration;
    }

    const setupvsoCall = this._azureDevOpsService.startDeployment(
      this.wizardValues.buildSettings.vstsAccount,
      deploymentObject,
      this.wizardValues.buildSettings.createNewVsoAccount
    );

    if (this.wizardValues.buildSettings.createNewVsoAccount) {
      return this._cacheService
        .post(
          `https://app.vsaex.visualstudio.com/_apis/HostAcquisition/collections?collectionName=${
            this.wizardValues.buildSettings.vstsAccount
          }&preferredRegion=${this.wizardValues.buildSettings.location}&api-version=4.0-preview.1`,
          true,
          this.getVstsDirectHeaders(false),
          {
            'VisualStudio.Services.HostResolution.UseCodexDomainForHostCreation': true,
          }
        )
        .switchMap(r => setupvsoCall)
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

  private get _ciConfig(): CiConfiguration {
    return {
      project: {
        name: this.wizardValues.buildSettings.vstsProject,
      },
    };
  }

  private get _deploymentSource(): CodeRepositoryDeploymentSource {
    return {
      type: DeploymentSourceType.CodeRepository,
      buildConfiguration: this._buildConfiguration,
      repository: this._repoInfo,
    };
  }

  private get _buildConfiguration(): BuildConfiguration {
    const buildConfig: BuildConfiguration = {
      type: this._applicationType,
      workingDirectory: this.wizardValues.buildSettings.workingDirectory,
      version: this.wizardValues.buildSettings.frameworkVersion,
    };

    if (this.isLinuxApp) {
      buildConfig.startupCommand = this.wizardValues.buildSettings.startupCommand;
    }
    if (this.wizardValues.buildSettings.applicationFramework === 'Ruby') {
      buildConfig.rubyFramework = 1;
    }
    if (this.wizardValues.buildSettings.applicationFramework === 'Python') {
      buildConfig.pythonExtensionId = this.wizardValues.buildSettings.pythonSettings.version;
      buildConfig.pythonFramework = this.wizardValues.buildSettings.pythonSettings.framework;
      if (buildConfig.pythonFramework === PythonFrameworkType.Flask) {
        buildConfig.flaskProjectName = this.wizardValues.buildSettings.pythonSettings.flaskProjectName;
      }
      if (buildConfig.pythonFramework === PythonFrameworkType.Django) {
        buildConfig.djangoSettingsModule = this.wizardValues.buildSettings.pythonSettings.djangoSettingsModule;
      }
    }
    return buildConfig;
  }

  private get _repoInfo(): CodeRepository {
    switch (this.wizardValues.sourceProvider) {
      case 'github':
        return this._githubRepoInfo;
      case 'vsts':
        return this._vstsRepoInfo;
      case 'external':
        return this._externalRepoInfo;
      default:
        return this._localGitInfo;
    }
  }

  private get _githubRepoInfo(): CodeRepository {
    const repoId = this.wizardValues.sourceSettings.repoUrl.replace('https://github.com/', '');
    return {
      authorizationInfo: {
        scheme: 'PersonalAccessToken',
        parameters: {
          AccessToken: `#{GithubToken}#`,
        },
      },
      defaultBranch: `refs/heads/${this.wizardValues.sourceSettings.branch}`,
      type: 'GitHub',
      id: repoId,
    };
  }

  private get _localGitInfo(): CodeRepository {
    return {
      type: 'LocalGit',
      id: null,
      defaultBranch: 'refs/heads/master',
      authorizationInfo: null,
    };
  }

  private get _vstsRepoInfo(): CodeRepository {
    return {
      type: 'TfsGit',
      id: this.selectedVstsRepoId,
      defaultBranch: `refs/heads/${this.wizardValues.sourceSettings.branch}`,
      authorizationInfo: null,
    };
  }

  private get _externalRepoInfo(): CodeRepository {
    const sourceSettings = this.wizardValues.sourceSettings;
    const privateRepo = sourceSettings.privateRepo;
    return {
      type: 'Git',
      id: sourceSettings.repoUrl,
      defaultBranch: sourceSettings.branch,
      authorizationInfo: {
        scheme: 'UsernamePassword',
        parameters: {
          username: privateRepo ? sourceSettings.username : '',
          password: privateRepo ? sourceSettings.password : '',
        },
      },
    };
  }

  private get _deploymentTargets(): DeploymentTarget[] {
    return [this._primaryTarget];
  }

  private get _primaryTarget(): AzureAppServiceDeploymentTarget {
    const tid = parseToken(this._token).tid;
    const siteDescriptor = new ArmSiteDescriptor(this._resourceId);
    const targetObject = {
      provider: DeploymentTargetProvider.Azure,
      type: this.isLinuxApp ? AzureResourceType.LinuxAppService : AzureResourceType.WindowsAppService,
      environmentType: TargetEnvironmentType.Production,
      friendlyName: 'Production',
      subscriptionId: siteDescriptor.subscription,
      subscriptionName: this.subscriptionName,
      tenantId: tid,
      resourceIdentifier: siteDescriptor.getFormattedTargetSiteName(),
      location: this._location,
      resourceGroupName: siteDescriptor.resourceGroup,
      authorizationInfo: {
        scheme: 'Headers',
        parameters: {
          Authorization: `Bearer ${this._vstsApiToken}`,
        },
      },
      createOptions: null,
      slotSwapConfiguration: null,
    };
    return targetObject;
  }

  private get _applicationType(): ApplicationType {
    switch (this.wizardValues.buildSettings.applicationFramework) {
      case 'AspNetWap':
        return ApplicationType.AspNetWap;
      case 'AspNetCore':
        return ApplicationType.AspNetCore;
      case 'Node':
        return ApplicationType.NodeJS;
      case 'PHP':
        return ApplicationType.PHP;
      case 'Python':
        return ApplicationType.Python;
      case 'Ruby':
        return ApplicationType.Ruby;
      case 'ScriptFunction':
        return ApplicationType.ScriptFunctionApp;
      case 'PrecompiledFunction':
        return ApplicationType.DotNetPreCompiledFunctionApp;
      case 'StaticWebapp':
        return ApplicationType.StaticWebapp;
      default:
        return ApplicationType.Undefined;
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

  public getVstsDirectHeaders(appendMsaPassthroughHeader: boolean = true): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Authorization', this.getToken());
    headers.append('X-VSS-ForceMsaPassThrough', `${appendMsaPassthroughHeader}`);
    return headers;
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

  private usePipelineTemplateAPI(): boolean {
    return IsPublishProfileBasedDeploymentEnabled && this.isWindowsApp;
  }

  private usePublishProfileToDeploy(): Observable<{ status: string; statusMessage: string; result: any }> {
    const success = {
      status: 'succeeded',
      statusMessage: null,
      result: true,
    };

    const fail = {
      status: 'failed',
      statusMessage: null,
      result: false,
    };

    if (IsPublishProfileBasedDeploymentEnabled && this.isWindowsApp) {
      return this._scenarioService
        .checkScenarioAsync(ScenarioIds.hasRoleAssignmentPermission, { site: this.siteArm })
        .take(1)
        .map(scenarioCheck => {
          if (scenarioCheck.status === 'disabled') {
            return success;
          } else {
            return fail;
          }
        });
    }
    return Observable.of(fail);
  }

  private getPipelineTemplateId(): string {
    switch (this._applicationType) {
      case ApplicationType.AspNetWap:
        return 'ms.vss-continuous-delivery-pipeline-templates.aspnet-windowswebapp-cd';

      case ApplicationType.AspNetCore:
        return 'ms.vss-continuous-delivery-pipeline-templates.aspnetcore-windowswebapp-cd';

      case ApplicationType.StaticWebapp:
        return 'ms.vss-continuous-delivery-pipeline-templates.staticwebsite-windowswebapp-cd';

      case ApplicationType.NodeJS:
        return 'ms.vss-continuous-delivery-pipeline-templates.nodejs-windowswebapp-cd';

      case ApplicationType.PHP:
        return 'ms.vss-continuous-delivery-pipeline-templates.simplephp-windowswebapp-cd';

      case ApplicationType.Python:
        switch (this.wizardValues.buildSettings.pythonSettings.framework) {
          case PythonFrameworkType.Flask:
            return 'ms.vss-continuous-delivery-pipeline-templates.pythonflask-windowswebapp-cd';

          case PythonFrameworkType.Bottle:
            return 'ms.vss-continuous-delivery-pipeline-templates.pythonbottle-windowswebapp-cd';

          case PythonFrameworkType.Django:
            return 'ms.vss-continuous-delivery-pipeline-templates.pythondjango-windowswebapp-cd';

          default:
            return null;
        }

      default:
        return null;
    }
  }

  private getPipelineTemplateParameters() {
    const tid = parseToken(this._token).tid;
    const siteDescriptor = new ArmSiteDescriptor(this._resourceId);

    const pipelineTemplateParameters = {
      subscriptionId: siteDescriptor.subscription,
      subscriptionName: this.subscriptionName,
      tenantId: tid,
      resourceGroupName: siteDescriptor.resourceGroup,
      webAppName: siteDescriptor.site,
      usePublishProfile: String(this._shouldUsePublishProfile),
      authorizationInfo: JSON.stringify({
        scheme: 'Headers',
        parameters: {
          Authorization: `Bearer ${this._vstsApiToken}`,
        },
      }),
    };

    switch (this._applicationType) {
      case ApplicationType.AspNetWap:
      case ApplicationType.AspNetCore:
        return pipelineTemplateParameters;

      case ApplicationType.StaticWebapp:
      case ApplicationType.PHP:
        return {
          pathToApplicationCode: this.wizardValues.buildSettings.workingDirectory,
          ...pipelineTemplateParameters,
        };

      case ApplicationType.NodeJS:
        return {
          pathToApplicationCode: this.wizardValues.buildSettings.workingDirectory,
          taskRunner: this.wizardValues.buildSettings.nodejsTaskRunner,
          ...pipelineTemplateParameters,
        };

      case ApplicationType.Python:
        switch (this.wizardValues.buildSettings.pythonSettings.framework) {
          case PythonFrameworkType.Flask:
            return {
              pathToApplicationCode: this.wizardValues.buildSettings.workingDirectory,
              pythonExtensionVersion: this.wizardValues.buildSettings.pythonSettings.version,
              djangoSettingModule: this.wizardValues.buildSettings.pythonSettings.djangoSettingsModule,
              ...pipelineTemplateParameters,
            };

          case PythonFrameworkType.Bottle:
            return {
              pathToApplicationCode: this.wizardValues.buildSettings.workingDirectory,
              pythonExtensionVersion: this.wizardValues.buildSettings.pythonSettings.version,
              ...pipelineTemplateParameters,
            };

          case PythonFrameworkType.Django:
            return {
              pathToApplicationCode: this.wizardValues.buildSettings.workingDirectory,
              pythonExtensionVersion: this.wizardValues.buildSettings.pythonSettings.version,
              flaskProjectName: this.wizardValues.buildSettings.pythonSettings.flaskProjectName,
              ...pipelineTemplateParameters,
            };

          default:
            return null;
        }

      default:
        return null;
    }
  }
}
