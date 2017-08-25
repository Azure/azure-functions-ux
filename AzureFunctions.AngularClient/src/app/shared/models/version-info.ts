export interface VersionInfo {
    runtimeStable: string[];
    proxyStable: string[];
    runtimeDefault: string;
    proxyDefault: string;
}

export class VersionInfoHelper {
    public static needToUpdateRuntime(version: VersionInfo, extensionVersion: string) {
        const match = version.runtimeStable.find(v => {
            return extensionVersion.toLowerCase() === v;
        });
        return !match;
    }
}
