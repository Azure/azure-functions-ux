export interface VirtualDirectory {
    virtualPath: string;
    physicalPath: string;
}

export interface VirtualApplication extends VirtualDirectory {
    preloadEnabled: boolean;
    virtualDirectories: VirtualDirectory[];
}

export interface VirtualApplicationsConfig {
    virtualApplications: VirtualApplication[];
}

export interface VirtualPathFlattened extends VirtualDirectory {
    isApplication: boolean;
}