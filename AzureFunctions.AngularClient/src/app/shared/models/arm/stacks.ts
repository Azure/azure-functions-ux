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

export class AvailableStackNames {
    public static readonly NetStack: string = "aspnet";
    public static readonly DotNetCore: string = "dotnetcore";
    public static readonly NodeStack: string = "node";
    public static readonly PhpStack: string = "php";
    public static readonly CustomContainer: string = "custom";
    public static readonly PythonStack: string = "python";
    public static readonly JavaStack: string = "java";
    public static readonly RubyStack: string = "ruby";
    public static readonly JavaContainer: string = "javaContainers";
}