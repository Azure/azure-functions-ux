export interface FunctionsVersionInfo {
    runtimeStable: string[];
    runtimeDefault: string;
}

export class FunctionsVersionInfoHelper {

    public static needToUpdateRuntime(version: FunctionsVersionInfo, extensionVersion: string) {
        const match = version.runtimeStable.find(v => {
            return extensionVersion.toLowerCase() === v;
        });
        return !match;
    }

    public static getFunctionGeneration(runtimeVersion: string) {
        if (!runtimeVersion) {
            return 'V1';
        }

        return (runtimeVersion.startsWith('~2')
            || runtimeVersion.startsWith('2')
            || runtimeVersion.startsWith('beta')) ? 'V2' : 'V1';
    }
}
