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

export class KuduBuildSettings {
    public repoUrl: string;
    public branch: string;
    public isManualIntegration: boolean;
    public deploymentRollbackEnabled: boolean;
    public isMercurial: boolean;
}
export class DeploymentCenterSetupModel {
    public sourceProvider: sourceControlProvider
    public buildProvider: sourceControlProvider;
    public buildSettings: VstsBuildSettings | KuduBuildSettings;
    public deploymentSlot: string;
    public sourceCodeSettings: any;

}

export type sourceControlProvider = 'dropbox' | 'onedrive' | 'github' | 'vsts' | 'external' | 'bitbucket' | 'localgit' | 'ftp' | 'webdeploy' | 'kudu';