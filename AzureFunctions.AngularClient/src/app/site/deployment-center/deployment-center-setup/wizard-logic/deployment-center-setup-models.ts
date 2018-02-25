export class WizardForm {
    public sourceProvider: sourceControlProvider;
    public buildProvider: sourceControlProvider;
    public sourceSettings: SourceSettings;
    public buildSettings: VstsBuildSettings;
}

export class VstsTestEnvironment {
    public enabled: boolean;
    public newApp: boolean;
    public appServicePlanId: string;
    public webAppId: string;
}
export class VstsBuildSettings {
    public createNewVsoAccount: string;
    public vstsAccount: string;
    public vstsProject: string;
    public location: string;
    public applicationFramework: string;
    public testEnvironment: VstsTestEnvironment;
    public deploymentSlot: string;
    public deploymentSlotEnabled: boolean;
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

export type sourceControlProvider = 'dropbox' | 'onedrive' | 'github' | 'vsts' | 'external' | 'bitbucket' | 'localgit' | 'ftp' | 'webdeploy' | 'kudu';





// THESE MODELS AND ENUMS COME DIRECTLY FROM VSO

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
    /**
     * Gets or sets the authorization parameters.
     */
    parameters: {
        Authorization: string;
    };
    /**
     * Gets or sets the authorization scheme.
     */
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


/**
 * Describes a generic Azure deployment target.
 */
export interface AzureDeploymentTarget extends DeploymentTarget {
    /**
     * Gets or sets the location of the target resource.
     */
    location: string;
    /**
     * Gets or sets the name of Azure resource group containing the target resource.
     */
    resourceGroupName: string;
    /**
     * Gets or sets the name/identifier of the target resource.
     */
    resourceIdentifier: string;
    /**
     * Gets or sets the Azure subscription id associated with the target resource.
     */
    subscriptionId: string;
    /**
     * Gets or sets the Azure subscription name associated with the target resource.
     */
    subscriptionName: string;
    /**
     * Gets or sets the Azure Active Directory tenant identifier.
     */
    tenantId: string;
    /**
     * Gets or sets the type of Azure resource.
     */
    type: AzureResourceType;
}