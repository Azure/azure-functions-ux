export enum ProviderType {
    None = 0,
    Tfs = 1,
    LocalGit = 2,
    GitHub = 3,
    CodePlexGit = 4,
    CodePlexHg = 5,
    BitbucketGit = 6,
    BitbucketHg = 7,
    Dropbox = 8,
    ExternalGit = 9,
    ExternalHg = 10,
    CodePlex = 11,
    Bitbucket = 12,
    External = 13,
    OneDrive = 14,
    VSO = 15,
    VSTSRM = 16
}

export interface Provider {
    title: string;
    subtitle: string;
    imgUrl: string;
    type: ProviderType;
}

export enum Status {
    Pending,
    Building,
    Deploying,
    Failed,
    Success
}

export interface Deployment {
    id: string;
    status: Status;
    author: string;
    deployer: string;
    message: string;
    progress: string;
    active: boolean;
    end_time: string;
    last_success_end_time: string;
    log_url: string;
}

export interface DeploymentLog {
    'log_time': string;
    'id': string;
    'message': string;
    'type': number;
    'details_url': string;
}

export interface SetupOAuthRequest {
    ScmType: ProviderType;
    CallbackUrl: string;
    AuthUrl: string;
    SetupToken: string;
    SetupTokenSecret: string;
    SiteName: string;
    SubscriptionId: string;
    ShellUrl: string;
}

export interface SetupOAuthResponse {
    UserName: string;

    Organizations: Organization[];

    AuthUrl: string;

    SetupToken: string;

    SetupTokenSecret: string;

    Folders: Folder[];
}

export interface Organization {
    Name: string;

    IsDefault: boolean;

    Repositories: Repository[];

    Type: string;
}

export interface Repository {
    name: string;
    default_branch: string;
    html_url: string;
    repo_url: string;
}

export interface Branch {
    name: string;
}

export interface Folder {
    Url: string;
    Name: string;
}

export interface SourceControls {
    repoUrl: string;
    branch: string;
    isManualIntegration: boolean;
    deploymentRollbackEnabled: boolean;
    isMercurial: boolean;
}
