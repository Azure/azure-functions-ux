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

// Temporary stack versions until linux supports available stacks API
export class LinuxConstants {
    public static readonly linuxFxVersionFormat: string = "{0}|{1}";
    public static readonly dockerPrefix: string = "DOCKER|";
    public static readonly builtInStacks: Framework[] =
    [
        {
            name: "node",
            display: "Node.js",
            majorVersions: [
                {
                    displayVersion: "4",
                    runtimeVersion: "4",
                    isDefault: false,
                    minorVersions: [
                        {
                            displayVersion: "4.4",
                            runtimeVersion: "4.4",
                            isDefault: false,
                        },
                        {
                            displayVersion: "4.5",
                            runtimeVersion: "4.5",
                            isDefault: false,
                        }
                    ]
                },
                {
                    displayVersion: "6",
                    runtimeVersion: "6",
                    isDefault: false,
                    minorVersions: [
                        {
                            displayVersion: "6.2",
                            runtimeVersion: "6.2",
                            isDefault: false,
                        },
                        {
                            displayVersion: "6.6",
                            runtimeVersion: "6.6",
                            isDefault: false,
                        },
                        {
                            displayVersion: "6.9",
                            runtimeVersion: "6.9",
                            isDefault: false,
                        },
                        {
                            displayVersion: "6.10",
                            runtimeVersion: "6.10",
                            isDefault: false,
                        },
                        {
                            displayVersion: "6.11",
                            runtimeVersion: "6.11",
                            isDefault: false,
                        }
                    ]
                },
                {
                    displayVersion: "8",
                    runtimeVersion: "8",
                    isDefault: false,
                    minorVersions: [
                        {
                            displayVersion: "8.0",
                            runtimeVersion: "8.0",
                            isDefault: false,
                        },
                        {
                            displayVersion: "8.1",
                            runtimeVersion: "8.1",
                            isDefault: false,
                        }
                    ]
                }
            ]
        },
        {
            name: "php",
            display: "PHP",
            majorVersions: [
                {
                    displayVersion: "5",
                    runtimeVersion: "5",
                    isDefault: false,
                    minorVersions: [
                        {
                            displayVersion: "5.6",
                            runtimeVersion: "5.6",
                            isDefault: false,
                        }
                    ]
                },
                {
                    displayVersion: "7",
                    runtimeVersion: "7",
                    isDefault: false,
                    minorVersions: [
                        {
                            displayVersion: "7.0",
                            runtimeVersion: "7.0",
                            isDefault: false,
                        }
                    ]
                }
            ]
        },
        {
            name: "dotnetcore",
            display: ".Net Core",
            majorVersions: [
                {
                    displayVersion: "1",
                    runtimeVersion: "1",
                    isDefault: false,
                    minorVersions: [
                        {
                            displayVersion: "1.0",
                            runtimeVersion: "1.0",
                            isDefault: false,
                        },
                        {
                            displayVersion: "1.1",
                            runtimeVersion: "1.1",
                            isDefault: false,
                        }
                    ]
                }
            ]
        },
        {
            name: "ruby",
            display: "Ruby",
            majorVersions: [
                {
                    displayVersion: "2",
                    runtimeVersion: "2",
                    isDefault: false,
                    minorVersions: [
                        {
                            displayVersion: "2.3",
                            runtimeVersion: "2.3",
                            isDefault: false,
                        }
                    ]
                }
            ]
        }
    ]
}