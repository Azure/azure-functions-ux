export class WizardForm {
  public sourceProvider: sourceControlProvider;
  public buildProvider: sourceControlProvider;
  public sourceSettings: SourceSettings;
  public buildSettings: VstsBuildSettings;
}

export class BuildSettings {
  public applicationFramework:
    | 'AspNetWap'
    | 'AspNetCore'
    | 'Node'
    | 'PHP'
    | 'Python'
    | 'StaticWebapp'
    | 'Ruby'
    | 'ScriptFunction'
    | 'PrecompiledFunction';
  public workingDirectory: string;
  public nodejsTaskRunner: string;
  public pythonSettings: PythonSettings;
  public frameworkVersion: string;
  public startupCommand: string;
  public runtimeStack: string;
  public runtimeStackVersion: string;
  public runtimeStackRecommendedVersion: string;
}

export class VstsBuildSettings extends BuildSettings {
  public createNewVsoAccount: boolean;
  public vstsAccount: string;
  public vstsProject: string;
  public location: string;
}

export class PythonSettings {
  public framework: PythonFrameworkType;
  public version: string;
  public flaskProjectName: string;
  public djangoSettingsModule: string;
}
export class SourceSettings {
  public repoUrl: string;
  public branch: string;
  public isManualIntegration: boolean;
  public isGitHubAction: boolean;
  public deploymentRollbackEnabled: boolean;
  public isMercurial: boolean;
  public privateRepo: boolean;
  public username: string;
  public password: string;
  public githubActionWorkflowOption: string;
  public githubActionExistingWorkflowContents: string;
}
export class DeploymentCenterSetupModel {
  public sourceProvider: sourceControlProvider;
  public buildProvider: sourceControlProvider;
  public sourceSettings: SourceSettings;
  public vstsBuildSettings: VstsBuildSettings;
}

export type sourceControlProvider =
  | 'dropbox'
  | 'onedrive'
  | 'github'
  | 'vsts'
  | 'external'
  | 'bitbucket'
  | 'localgit'
  | 'ftp'
  | 'webdeploy'
  | 'kudu'
  | 'zip';

// THESE MODELS AND ENUMS COME DIRECTLY FROM VSO

/*********************
 * DEPLOYMENT TARGET MODELS
 */

export interface ProvisioningConfigurationBase {
  authToken: string;
  /**
   * Gets or sets the unique identifier of the provisioning configuration.
   */
  id: string;

  /**
   * Gets or sets the CI/CD configuration details.
   */
  ciConfiguration: CiConfiguration;
}

export interface ProvisioningConfiguration extends ProvisioningConfigurationBase {
  /**
   * Gets or sets the deployment source.
   */
  source: DeploymentSource;
  /**
   * Gets or sets one or more deployment targets.
   */
  targets: DeploymentTarget[];
}

export interface ProvisioningConfigurationV2 extends ProvisioningConfigurationBase {
  /* Below parameters are for pipelineTemplate API*/
  pipelineTemplateId: string;

  pipelineTemplateParameters: { [key: string]: string };

  repository: CodeRepository;
}

export enum DeploymentTargetProvider {
  /**
   * Deployment target provider is not specified.
   */
  Undefined = 0,
  /**
   * Azure deployment target provider.
   */
  Azure = 1,
}

/**
 * Describes the Azure App-Service (Windows) deployment target.
 */
export interface AzureAppServiceDeploymentTarget extends AzureDeploymentTarget {
  /**
   * Gets or sets the properties of Azure App-Service to be created.
   */
  createOptions: AzureAppServiceCreateOptions;
  /**
   * Gets or sets the slot swap configuration.
   */
  slotSwapConfiguration: SlotSwapConfiguration;
}

/**
 * Describes the configuration for swapping deployment slots.
 */
export interface SlotSwapConfiguration {
  /**
   * Gets or sets the name of deployment slot.
   */
  slotName: string;
}

/**
 * Describes the properties of the Azure App-Service to be created.
 */
export interface AzureAppServiceCreateOptions {
  /**
   * Gets or sets the name of Azure App-Service.
   */
  appServicePlanName: string;
  /**
   * Gets or sets the pricing tier of Azure App-Service.
   */
  appServicePricingTier: string;
  /**
   * Gets or sets the name of Azure App-Service from which the new App-Service should be cloned.
   */
  baseAppServiceName: string;
}

/**
 * Describes a generic/base deployment target.
 */
export interface DeploymentTarget {
  /**
   * Gets or sets the authorization details used to access the target.
   */
  authorizationInfo: Authorization;
  /**
   * Gets or sets the type of target environment.
   */
  environmentType: TargetEnvironmentType;
  /**
   * Gets or sets the friendly name for the target.
   */
  friendlyName: string;
  /**
   * Gets or sets the deployment target provider.
   */
  provider: DeploymentTargetProvider;
}

/**
 * Defines the possible types of environments.
 */
export enum TargetEnvironmentType {
  /**
   * Target environment type is not specified.
   */
  Undefined = 0,
  /**
   * Production environment.
   */
  Production = 1,
  /**
   * Test environment.
   */
  Test = 2,
}
/**
 * Specifies information related to authorization.
 */
export interface Authorization {
  parameters: { [key: string]: string };
  scheme: string;
}

/**
 * Defines the various Azure resource types supported.
 */
export enum AzureResourceType {
  /**
   * Resource type is not specified.
   */
  Undefined = 0,
  /**
   * Windows App-Service resource type.
   */
  WindowsAppService = 1,
  /**
   * Linux App-Service resource type.
   */
  LinuxAppService = 2,
}

export interface AzureDeploymentTarget extends DeploymentTarget {
  location: string;
  resourceGroupName: string;
  resourceIdentifier: string;
  subscriptionId: string;
  subscriptionName: string;
  tenantId: string;
  type: AzureResourceType;
}

export interface CiConfiguration {
  project: ProjectReference;
}

export interface ProjectReference {
  name: string;
}

/**
 * Defines the supported deployment source types.
 */
export enum DeploymentSourceType {
  /**
   * Deployment source type is not specified.
   */
  Undefined = 0,
  /**
   * Code repository deployment source.
   */
  CodeRepository = 1,
  /**
   * VSTS build deployment source.
   */
  VstsBuild = 2,
  /**
   * Code template deployment source.
   */
  CodeTemplate = 3,
}

export interface DeploymentSource {
  type: DeploymentSourceType;
}

export interface CodeRepositoryDeploymentSource extends DeploymentSource {
  buildConfiguration: BuildConfiguration;
  repository: CodeRepository;
}

/**
 * Describes the type of application.
 */
export enum ApplicationType {
  Undefined = 0,
  AspNetWap = 1,
  AspNetCore = 2,
  NodeJS = 3,
  AzureVirtualMachineImage = 4,
  DockerImage = 5,
  DotNetContainerServices = 6,
  Python = 7,
  PHP = 8,
  ContainerServices = 9,
  ScriptFunctionApp = 10,
  DotNetPreCompiledFunctionApp = 11,
  StaticWebapp = 12,
  CustomScript = 13,
  Java = 14,
  Ruby = 15,
}
export enum PythonFrameworkType {
  Undefined = 0,
  Bottle = 1,
  Django = 2,
  Flask = 3,
}
export interface BuildConfiguration {
  type: ApplicationType;
  workingDirectory: string;
  version?: string;
  startupCommand?: string;
  rubyFramework?: number;
  pythonExtensionId?: string;
  pythonFramework?: number;
  flaskProjectName?: string;
  djangoSettingsModule?: string;
}

export interface CodeRepository {
  authorizationInfo: Authorization;
  defaultBranch: string;
  type: string;
  id?: string;
}

/**
 * AAD authorization parameters which are required for verifying if a user has permissions to register a new app in an Active Directory
 */
export interface AadAuthorizationParameters {
  /**
   * Gets tenant Id of the Azure Active Directory
   */
  tenantId: string;
  /**
   * Gets Azure active directory issued token for VSTS service
   */
  token: string;
}

export interface PermissionsResultCreationParameters {
  aadPermissions: AadAuthorizationParameters;
}

export interface PermissionResult {
  message: string;
  value: boolean;
}

export interface PermissionsResult {
  aadPermissions: PermissionResult;
}
