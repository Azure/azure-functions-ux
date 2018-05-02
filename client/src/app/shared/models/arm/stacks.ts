export interface MinorVersion {
    displayVersion: string;
    runtimeVersion: string;
    isDefault: boolean;
}

export interface MajorVersion extends MinorVersion {
    minorVersions: MinorVersion[];
}

export interface Framework {
    name: string;
    display: string;
    majorVersions: MajorVersion[];
}

export interface AvailableStack extends Framework {
    frameworks: Framework[];
}

export type AvailableStacksOsType = 'Linux' | 'Windows';

export namespace AvailableStacksOsType {
    export const Linux: AvailableStacksOsType = 'Linux';
    export const Windows: AvailableStacksOsType = 'Windows';
}

export class AvailableStackNames {
    public static readonly NetStack = 'aspnet';
    public static readonly DotNetCore = 'dotnetcore';
    public static readonly NodeStack = 'node';
    public static readonly PhpStack = 'php';
    public static readonly CustomContainer = 'custom';
    public static readonly PythonStack = 'python';
    public static readonly JavaStack = 'java';
    public static readonly RubyStack = 'ruby';
    public static readonly JavaContainer = 'javaContainers';
}

export class LinuxConstants {
    public static readonly dockerPrefix = 'DOCKER|';
    public static readonly composePrefix = 'COMPOSE|';
    public static readonly kubernetesPrefix = 'KUBE|';
}