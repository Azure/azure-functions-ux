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
    public static NetStack: string = "aspnet";
    public static DotNetCore: string = "dotnetcore";
    public static NodeStack: string = "node";
    public static PhpStack: string = "php";
    public static CustomContainer: string = "custom";
    public static PythonStack: string = "python";
    public static JavaStack: string = "java";
    public static RubyStack: string = "ruby";
    public static JavaContainer: string = "javaContainers";
}