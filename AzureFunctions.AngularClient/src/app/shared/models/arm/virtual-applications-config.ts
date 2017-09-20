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