export interface FunctionsVersionInfo {
    runtimeStable: string[];
    proxyStable: string[];
    runtimeDefault: string;
    proxyDefault: string;
}

export class FunctionsVersionInfoHelper {
    public static needToUpdateRuntime(version: FunctionsVersionInfo, extensionVersion: string) {
        const match = version.runtimeStable.find(v => {
            return extensionVersion.toLowerCase() === v;
        });
        return !match;
    }
}
