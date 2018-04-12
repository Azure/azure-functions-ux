export interface RespositoryProperties {
    connectedServiceId: string;
    apiUrl: string;
    branchesUrl: string;
    cloneUrl: string;
    refsUrl: string;
}

export interface Repository {
    properties: RespositoryProperties;
    id: string;
    type: string;
    url: string;
    defaultBranch: string;
    clean: string;
    checkoutSubmodules: boolean;
}

export interface AuthoredBy {
    id: string;
    displayName: string;
    uniqueName: string;
    url: string;
    imageUrl: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    url: string;
    state: string;
    revision: number;
    visibility: string;
}

export interface VSOBuildDefinition {
    repository: Repository;
    authoredBy: AuthoredBy;
    url: string;
    id: number;
    name: string;
    path: string;
    type: string;
    revision: number;
    createdDate: Date;
    project: Project;
}

export interface UrlInfo {
    urlIcon?: string;
    urlText: string;
    url: string;
}

export interface ActivityDetailsLog {
    type: string;
    id: string;
    icon: string;
    message: string;
    date: string;
    time: string;
    urlInfo: UrlInfo[];
}

export interface KuduLogMessage {
    type: string;
    commitId?: string;
    buildId?: number;
    releaseId?: number;
    buildNumber?: string;
    releaseName?: string;
    repoProvider?: string;
    repoName?: string;
    collectionUrl?: string;
    teamProject?: string;
    prodAppName?: string;
    slotName?: string;
    sourceSlot?: string;
    targetSlot?: string;
    message?: string;
    VSTSRM_BuildDefinitionWebAccessUrl?: string;
    VSTSRM_ConfiguredCDEndPoint?: string;
    VSTSRM_BuildWebAccessUrl?: string;
    AppUrl?: string;
    SlotUrl?: string;
    VSTSRM_AccountUrl?: string;
    VSTSRM_RepoUrl?: string;
    VSTSRM_AccountId?: string;
}
