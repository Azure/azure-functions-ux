export enum VSTSLogMessageType {
    Deployment = 0,
    SlotSwap = 1,
    CDDeploymentConfiguration = 2,
    CDSlotCreation = 3,
    CDTestWebAppCreation = 4,
    CDAccountCreated = 5,
    CDDisconnect = 6,
    StartAzureAppService = 7,
    StopAzureAppService = 8,
    RestartAzureAppService = 9,
    Other = 10,
    Sync = 11,
    LocalGitCdConfiguration = 12
}

export enum ProviderType {
    None = 0,
    VSTS = 1,
    GitHub = 2,
    BitbucketGit = 3,
    Tfs = 4,
    ExternalGit = 5,
    LocalGit = 6
}

export enum ScmType {
    None = 0,
    VSTSRM = 1,
    Kudu = 2
}
