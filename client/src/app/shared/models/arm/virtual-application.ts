export interface VirtualDirectory {
    virtualPath: string;
    physicalPath: string;
}

export interface VirtualApplication extends VirtualDirectory {
    virtualDirectories: VirtualDirectory[];
}