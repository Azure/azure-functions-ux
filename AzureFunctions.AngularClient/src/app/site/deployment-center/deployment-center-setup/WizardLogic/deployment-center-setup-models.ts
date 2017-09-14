export class VstsTestEnvironment {
    public enabled: boolean;
    public AppServicePlanId: string;
    public AppName: string;
}
export class VstsBuildSettings { 
    public createNewVsoAccount: boolean
    public vstsAccount: string;
    public vstsProject: string;
    public location :string;
    public applicationFramework: string;
    public testEnvironment: VstsTestEnvironment;
}
export class DeploymentCenterSetupModel {
    public sourceProvider: sourceControlProvider
    public buildProvider: sourceControlProvider;
    public vstsBuildSettings: VstsBuildSettings
    public deploymentSlot: string;
    public sourceCodeSettings: any;

}

export type sourceControlProvider = 'dropbox' | 'onedrive' | 'github' | 'vsts' | 'external' | 'bitbucket' | 'localgit' | 'ftp' | 'webdeploy' | 'kudu';