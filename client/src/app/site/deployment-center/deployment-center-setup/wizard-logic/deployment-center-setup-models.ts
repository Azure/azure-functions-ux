export class WizardForm {
    public sourceProvider: sourceControlProvider;
    public buildProvider: sourceControlProvider;
    public sourceSettings: SourceSettings;
    public buildSettings: VstsBuildSettings;
    public testEnvironment: VstsTestEnvironment;
    public deploymentSlotSetting: DeploymentSLotSettings;
}

export class DeploymentSLotSettings {
    public newDeploymentSlot: boolean;
    public deploymentSlot: string;
    public deploymentSlotEnabled: boolean;
}
export class VstsTestEnvironment {
    public enabled: boolean;
    public newApp: boolean;
    public appServicePlanId: string;
    public webAppId: string;
}
export class VstsBuildSettings {
    public createNewVsoAccount: boolean;
    public vstsAccount: string;
    public vstsProject: string;
    public location: string;
    public applicationFramework: string;
    public workerDirecory: string;
    public nodejsTaskRunner: string;
    public pythonSettings: any;
}

export class PythonSettings {
    public framework: string;
    public version: string;
    public flaskProjectName: string;
    public djangoSettingsModule: string;
}
export class SourceSettings {
    public repoUrl: string;
    public branch: string;
    public isManualIntegration: boolean;
    public deploymentRollbackEnabled: boolean;
    public isMercurial: boolean;
}
export class DeploymentCenterSetupModel {
    public sourceProvider: sourceControlProvider;
    public buildProvider: sourceControlProvider;
    public sourceSettings: SourceSettings;
    public vstsBuildSettings: VstsBuildSettings;

}

export type sourceControlProvider = 'dropbox' | 'onedrive' | 'github' | 'vsts' | 'external' | 'bitbucket' | 'localgit' | 'ftp' | 'webdeploy' | 'kudu' | 'zip';





// THESE MODELS AND ENUMS COME DIRECTLY FROM VSO



/*********************
 * DEPLOYMENT TARGET MODELS
 */

export interface ProvisioningConfiguration {
    /**
     * Gets or sets the CI/CD configuration details.
     */
    ciConfiguration: CiConfiguration;
    /**
     * Gets or sets the unique identifier of the provisioning configuration.
     */
    id: string;
    /**
     * Gets or sets the deployment source.
     */
    source: DeploymentSource;
    /**
     * Gets or sets one or more deployment targets.
     */
    targets: DeploymentTarget[];
}


export enum DeploymentTargetProvider {
    /**
     * Deployment target provider is not specified.
     */
    Undefined = 0,
    /**
     * Azure deployment target provider.
     */
    Azure = 1
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
    Test = 2
}
/**
 * Specifies information related to authorization.
 */
export interface Authorization {
    parameters: { [key: string]: string; };
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
    CodeTemplate = 3
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
    /**
     * Applicate type is not specified.
     */
    Undefined = 0,
    /**
     * ASP.NET web application.
     */
    AspNetWap = 1,
    /**
     * ASP.NET Core web application.
     */
    AspNetCore = 2,
    /**
     * NodeJS application.
     */
    NodeJS = 3,
    /**
     * Virtual Machine image.
     */
    AzureVirtualMachineImage = 4,
    /**
     * Docker container image.
     */
    DockerImage = 5,
    /**
     * .NET container services application.
     */
    DotNetContainerServices = 6,
    /**
     * Python application.
     */
    Python = 7,
    /**
     * PHP application.
     */
    PHP = 8,
    /**
     * Generic container services application.
     */
    ContainerServices = 9,
    /**
     * Function App containing only script files.
     */
    ScriptFunctionApp = 10,
    /**
     * Function App containing buildable code.
     */
    DotNetPreCompiledFunctionApp = 11,
    /**
     * Static Webapp.
     */
    StaticWebapp = 12,
    /**
     * An application which gets executed/installed via a custom script
     */
    CustomScript = 13,
    /**
     * Java web application.
     */
    Java = 14
}

export interface BuildConfiguration {
    type: ApplicationType;
    workingDirectory: string;
}

export interface CodeRepository {
    authorizationInfo: Authorization;
    defaultBranch: string;
    type: string;
    id?: string;
}