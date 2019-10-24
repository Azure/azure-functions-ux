import { Injectable, OnDestroy } from '@angular/core';
import { UserService } from 'app/shared/services/user.service';
import { Subject } from 'rxjs/Subject';
import { Http } from '@angular/http';
import { Headers } from '@angular/http';
import { AuthoricatedUserContext, DevOpsAccount, DevOpsList, DevOpsProject } from './azure-devops-service-models';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { uniqBy } from 'lodash-es';
import { of } from 'rxjs/observable/of';
import { Observable } from 'rxjs/Observable';
import { Constants, DeploymentCenterConstants, ScenarioIds, Kinds } from 'app/shared/models/constants';
import { ScenarioService } from 'app/shared/services/scenario/scenario.service';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';
import {
  ApplicationType,
  DeploymentTargetProvider,
  AzureAppServiceDeploymentTarget,
  TargetEnvironmentType,
  AzureResourceType,
  DeploymentTarget,
  CiConfiguration,
  CodeRepositoryDeploymentSource,
  DeploymentSourceType,
  BuildConfiguration,
  PythonFrameworkType,
  CodeRepository,
  ProvisioningConfigurationV2,
  ProvisioningConfiguration,
  VstsBuildSettings,
  SourceSettings,
} from './deployment-center-setup-models';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { parseToken } from 'app/pickers/microsoft-graph/microsoft-graph-helper';
import { ProvisioningConfigurationBase, WizardForm } from './deployment-center-setup-models';

export enum AzureDevOpsDeploymentMethod {
  UseV1Api = 0,
  UseV2Api,
  UsePublishProfile,
}

@Injectable()
export class AzureDevOpsService implements OnDestroy {
  private _ngUnsubscribe$ = new Subject();
  private _token: string;
  private _authenticatedUser: AuthoricatedUserContext;
  private _accountsList: DevOpsAccount[] = [];

  constructor(private _httpClient: Http, private _userService: UserService, private _scenarioService: ScenarioService) {
    this._userService
      .getStartupInfo()
      .takeUntil(this._ngUnsubscribe$)
      .subscribe(r => {
        this._token = r.token;
      });
  }

  getUserContext() {
    const userContext = `https://app.vssps.visualstudio.com/_apis/connectionData`;
    if (this._authenticatedUser) {
      return of(this._authenticatedUser);
    }
    return this._httpClient
      .get(userContext, {
        headers: this._headersWithoutPassthrough,
      })
      .map(x => {
        this._authenticatedUser = x.json();
        return this._authenticatedUser;
      });
  }
  getAccounts() {
    if (this._accountsList.length > 0) {
      return of(this._accountsList);
    }
    return this.getUserContext()
      .switchMap(user => {
        const accountUrl = `https://app.vssps.visualstudio.com/_apis/accounts?memeberId=${
          user.authenticatedUser.descriptor
        }?api-version=5.0-preview.1`;
        return forkJoin([
          this._httpClient.get(accountUrl, { headers: this._headersWithoutPassthrough }),
          this._httpClient.get(accountUrl, { headers: this._headersWithPassthrough }),
        ]);
      })
      .map(([accounts1, accounts2]) => {
        const accountList1: DevOpsAccount[] = accounts1.json().map(account => ({ ...account, ForceMsaPassThrough: false }));
        const accountList2: DevOpsAccount[] = accounts2.json().map(account => ({ ...account, ForceMsaPassThrough: true }));
        const mixedAccountList = uniqBy(accountList1.concat(accountList2), 'AccountId');
        this._accountsList = mixedAccountList;
        return mixedAccountList;
      });
  }

  getProjectsForAccount(account: string): Observable<DevOpsList<DevOpsProject>> {
    const uri = `https://dev.azure.com/${account}/_apis/projects`;
    return this.getAccounts().switchMap(r => {
      const msaPassthrough = r.find(x => x.AccountName.toLowerCase() === account.toLowerCase())!.ForceMsaPassThrough;
      return this._httpClient
        .get(uri, {
          headers: msaPassthrough ? this._headersWithPassthrough : this._headersWithoutPassthrough,
        })
        .map(res => res.json());
    });
  }
  getBranchesForRepo(account: string, repositoryId: string) {
    const uri = `https://dev.azure.com/${account}/_apis/git/repositories/${repositoryId}/refs?api-version=5.0`;
    return this.getAccounts().switchMap(r => {
      const msaPassthrough = r.find(x => x.AccountName.toLowerCase() === account.toLowerCase())!.ForceMsaPassThrough;
      return this._httpClient
        .get(uri, {
          headers: msaPassthrough ? this._headersWithPassthrough : this._headersWithoutPassthrough,
        })
        .map(res => res.json());
    });
  }
  getRepositoriesForAccount(account: string) {
    const uri = `https://dev.azure.com/${account}/_apis/git/repositories`;
    return this.getAccounts().switchMap(r => {
      const msaPassthrough = r.find(x => x.AccountName.toLowerCase() === account.toLowerCase())!.ForceMsaPassThrough;
      return this._httpClient
        .get(uri, {
          headers: msaPassthrough ? this._headersWithPassthrough : this._headersWithoutPassthrough,
        })
        .map(res => res.json());
    });
  }

  startDeployment(account: string, deploymentObj: any, isNewVsoAccount: boolean) {
    if (isNewVsoAccount) {
      this._accountsList = [];
    }
    const uri = `${Constants.serviceHost}api/setupvso?accountName=${account}`;
    return this.getAccounts().switchMap(r => {
      const msaPassthrough = isNewVsoAccount
        ? false
        : r.find(x => x.AccountName.toLowerCase() === account.toLowerCase())!.ForceMsaPassThrough;
      return this._httpClient
        .post(uri, deploymentObj, {
          headers: msaPassthrough ? this._headersWithPassthrough : this._headersWithoutPassthrough,
        })
        .map(res => res.json());
    });
  }

  getBuildDef(account: string, projectUrl: string, buildId: string) {
    const uri = `${projectUrl}/_apis/build/Definitions/${buildId}?api-version=2.0`;
    return this.getAccounts().switchMap(r => {
      const msaPassthrough = r.find(x => x.AccountName.toLowerCase() === account.toLowerCase())!.ForceMsaPassThrough;
      return this._httpClient
        .get(uri, {
          headers: msaPassthrough ? this._headersWithPassthrough : this._headersWithoutPassthrough,
        })
        .map(res => res.json());
    });
  }

  getPermissionResult(permissionPayload: any) {
    return this._httpClient
      .post(DeploymentCenterConstants.vstsPermissionApiUri, permissionPayload, {
        headers: this._headersWithoutPassthrough,
      })
      .map(res => res.json());
  }

  public getAzureDevOpsDeploymentMethod(siteArm: ArmObj<Site>): Observable<{ status: string; statusMessage: string; result: any }> {
    const returnValue = {
      status: 'succeeded',
      statusMessage: null,
      result: AzureDevOpsDeploymentMethod.UseV1Api,
    };

    if (this._scenarioService.checkScenario(ScenarioIds.isPublishProfileBasedDeploymentEnabled, { site: siteArm }).status === 'enabled') {
      return this._scenarioService
        .checkScenarioAsync(ScenarioIds.hasRoleAssignmentPermission, { site: siteArm })
        .take(1)
        .map(scenarioCheck => {
          if (scenarioCheck.status === 'disabled') {
            returnValue.result = AzureDevOpsDeploymentMethod.UsePublishProfile;
          } else {
            returnValue.result = AzureDevOpsDeploymentMethod.UseV2Api;
          }
          return returnValue;
        });
    }
    return Observable.of(returnValue);
  }

  public getAzureDevOpsProvisioningConfiguration(
    wizardValues: WizardForm,
    siteArm: ArmObj<Site>,
    subscriptionName: string,
    azureDevOpsAuthToken: string,
    azureDevOpsDeploymentMethod: AzureDevOpsDeploymentMethod
  ): ProvisioningConfigurationBase {
    let deploymentObject: ProvisioningConfigurationBase;

    if (
      azureDevOpsDeploymentMethod === AzureDevOpsDeploymentMethod.UsePublishProfile ||
      azureDevOpsDeploymentMethod === AzureDevOpsDeploymentMethod.UseV2Api
    ) {
      deploymentObject = {
        pipelineTemplateId: this.getPipelineTemplateId(wizardValues.buildSettings),
        pipelineTemplateParameters: this.getPipelineTemplateParameters(
          wizardValues.buildSettings,
          siteArm.id,
          subscriptionName,
          azureDevOpsAuthToken,
          azureDevOpsDeploymentMethod
        ),
        ciConfiguration: this._ciConfig(wizardValues.buildSettings.vstsProject),
        repository: this._repoInfo(wizardValues),
        id: null,
      } as ProvisioningConfigurationV2;
    } else {
      deploymentObject = {
        authToken: azureDevOpsAuthToken,
        ciConfiguration: this._ciConfig(wizardValues.buildSettings.vstsProject),
        id: null,
        source: this._deploymentSource(wizardValues, siteArm.kind),
        targets: this._deploymentTargets(azureDevOpsAuthToken, siteArm, subscriptionName),
      } as ProvisioningConfiguration;
    }
    return deploymentObject;
  }

  private _ciConfig(azureDevOpsProjectName: string): CiConfiguration {
    return {
      project: {
        name: azureDevOpsProjectName,
      },
    };
  }

  private _deploymentSource(wizardValues: WizardForm, webAppKind: string): CodeRepositoryDeploymentSource {
    return {
      type: DeploymentSourceType.CodeRepository,
      buildConfiguration: this._buildConfiguration(wizardValues.buildSettings, webAppKind),
      repository: this._repoInfo(wizardValues),
    };
  }

  private _buildConfiguration(buildSettings: VstsBuildSettings, webAppKind: string): BuildConfiguration {
    const buildConfig: BuildConfiguration = {
      type: this._getApplicationType(buildSettings.applicationFramework),
      workingDirectory: buildSettings.workingDirectory,
      version: buildSettings.frameworkVersion,
    };

    if (webAppKind.toLowerCase().includes(Kinds.linux)) {
      buildConfig.startupCommand = buildSettings.startupCommand;
    }
    if (buildSettings.applicationFramework === 'Ruby') {
      buildConfig.rubyFramework = 1;
    }
    if (buildSettings.applicationFramework === 'Python') {
      buildConfig.pythonExtensionId = buildSettings.pythonSettings.version;
      buildConfig.pythonFramework = buildSettings.pythonSettings.framework;
      if (buildConfig.pythonFramework === PythonFrameworkType.Flask) {
        buildConfig.flaskProjectName = buildSettings.pythonSettings.flaskProjectName;
      }
      if (buildConfig.pythonFramework === PythonFrameworkType.Django) {
        buildConfig.djangoSettingsModule = buildSettings.pythonSettings.djangoSettingsModule;
      }
    }
    return buildConfig;
  }

  private _repoInfo(wizardValues: WizardForm): CodeRepository {
    switch (wizardValues.sourceProvider) {
      case 'github':
        return this._githubRepoInfo(wizardValues.sourceSettings);
      case 'vsts':
        return this._vstsRepoInfo(wizardValues.sourceSettings);
      case 'external':
        return this._externalRepoInfo(wizardValues.sourceSettings);
      default:
        return this._localGitInfo();
    }
  }

  private _githubRepoInfo(sourceSettings: SourceSettings): CodeRepository {
    const repoId = sourceSettings.repoUrl.replace('https://github.com/', '');
    return {
      authorizationInfo: {
        scheme: 'PersonalAccessToken',
        parameters: {
          AccessToken: `#{GithubToken}#`,
        },
      },
      defaultBranch: `refs/heads/${sourceSettings.branch}`,
      type: 'GitHub',
      id: repoId,
    };
  }

  private _localGitInfo(): CodeRepository {
    return {
      type: 'LocalGit',
      id: null,
      defaultBranch: 'refs/heads/master',
      authorizationInfo: null,
    };
  }

  private _vstsRepoInfo(sourceSettings: SourceSettings): CodeRepository {
    return {
      type: 'TfsGit',
      id: sourceSettings.repoUrl,
      defaultBranch: `refs/heads/${sourceSettings.branch}`,
      authorizationInfo: null,
    };
  }

  private _externalRepoInfo(sourceSettings: SourceSettings): CodeRepository {
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

  private _deploymentTargets(azureDevOpsAuthToken: string, siteArm: ArmObj<Site>, subscriptionName: string): DeploymentTarget[] {
    return [this._primaryTarget(azureDevOpsAuthToken, siteArm, subscriptionName)];
  }

  private _primaryTarget(azureDevOpsAuthToken: string, siteArm: ArmObj<Site>, subscriptionName: string): AzureAppServiceDeploymentTarget {
    const tid = parseToken(this._token).tid;
    const siteDescriptor = new ArmSiteDescriptor(siteArm.id);
    const targetObject = {
      provider: DeploymentTargetProvider.Azure,
      type: siteArm.kind.toLowerCase().includes(Kinds.linux) ? AzureResourceType.LinuxAppService : AzureResourceType.WindowsAppService,
      environmentType: TargetEnvironmentType.Production,
      friendlyName: 'Production',
      subscriptionId: siteDescriptor.subscription,
      subscriptionName: subscriptionName,
      tenantId: tid,
      resourceIdentifier: siteDescriptor.getFormattedTargetSiteName(),
      location: siteArm.location,
      resourceGroupName: siteDescriptor.resourceGroup,
      authorizationInfo: {
        scheme: 'Headers',
        parameters: {
          Authorization: `Bearer ${azureDevOpsAuthToken}`,
        },
      },
      createOptions: null,
      slotSwapConfiguration: null,
    };
    return targetObject;
  }

  private _getApplicationType(applicationFramework: string): ApplicationType {
    switch (applicationFramework) {
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

  private getPipelineTemplateId(buildSettings: VstsBuildSettings): string {
    switch (this._getApplicationType(buildSettings.applicationFramework)) {
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
        switch (buildSettings.pythonSettings.framework) {
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

  private getPipelineTemplateParameters(
    buildSettings: VstsBuildSettings,
    resourceId: string,
    subscriptionName: string,
    azureDevOpsAuthToken: string,
    azureDevOpsDeploymentMethod: AzureDevOpsDeploymentMethod
  ) {
    const tid = parseToken(this._token).tid;
    const siteDescriptor = new ArmSiteDescriptor(resourceId);

    const pipelineTemplateParameters = {
      subscriptionId: siteDescriptor.subscription,
      subscriptionName: subscriptionName,
      resourceGroupName: siteDescriptor.resourceGroup,
      webAppName: siteDescriptor.site,
      stagingOption: !!siteDescriptor.slot ? 'true' : 'false',
      webAppSlotName: !!siteDescriptor.slot ? siteDescriptor.slot : '',
      usePublishProfile: azureDevOpsDeploymentMethod === AzureDevOpsDeploymentMethod.UsePublishProfile ? 'true' : 'false',
      azureDevOpsAuth: JSON.stringify({
        scheme: 'Headers',
        parameters: {
          Authorization: `Bearer ${azureDevOpsAuthToken}`,
          tenantId: tid,
        },
      }),
    };

    switch (this._getApplicationType(buildSettings.applicationFramework)) {
      case ApplicationType.AspNetWap:
      case ApplicationType.AspNetCore:
        return pipelineTemplateParameters;

      case ApplicationType.StaticWebapp:
      case ApplicationType.PHP:
        return {
          pathToApplicationCode: buildSettings.workingDirectory,
          ...pipelineTemplateParameters,
        };

      case ApplicationType.NodeJS:
        return {
          pathToApplicationCode: buildSettings.workingDirectory,
          taskRunner: buildSettings.nodejsTaskRunner,
          ...pipelineTemplateParameters,
        };

      case ApplicationType.Python:
        let pythonParameters = {
          pathToApplicationCode: buildSettings.workingDirectory,
          pythonExtensionVersion: buildSettings.pythonSettings.version,
        };
        switch (buildSettings.pythonSettings.framework) {
          case PythonFrameworkType.Django:
            return {
              djangoSettingModule: buildSettings.pythonSettings.djangoSettingsModule,
              ...pipelineTemplateParameters,
              ...pythonParameters,
            };

          case PythonFrameworkType.Bottle:
            return {
              ...pipelineTemplateParameters,
              ...pythonParameters,
            };

          case PythonFrameworkType.Flask:
            return {
              flaskProjectName: buildSettings.pythonSettings.flaskProjectName,
              ...pipelineTemplateParameters,
              ...pythonParameters,
            };

          default:
            return null;
        }

      default:
        return null;
    }
  }

  private get _headersWithPassthrough(): Headers {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${this._token}`);
    headers.append('X-VSS-ForceMsaPassThrough', 'true');
    return headers;
  }

  private get _headersWithoutPassthrough(): Headers {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${this._token}`);
    return headers;
  }
  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }
}
