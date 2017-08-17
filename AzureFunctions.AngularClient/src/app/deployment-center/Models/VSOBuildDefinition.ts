
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
