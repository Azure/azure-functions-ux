export class RuntimeVersions {

    public static getRuntimeParts(exactRuntime: string) {
        return exactRuntime.split('.');
    }

    public static majorVersion(exactRuntime: string) {
        const parts = this.getRuntimeParts(exactRuntime);
        if (parts.length > 0) {
            return Number(parts[0]);
        }
        return null;
    }

    public static minorVersion(exactRuntime: string) {
        const parts = this.getRuntimeParts(exactRuntime);
        if (parts.length > 2) {
            return Number(parts[2]);
        }
        return null;
    }

    public static workerRuntimeRequired(exactRuntime: string) {
        const minorVersion = this.minorVersion(exactRuntime);
        if (minorVersion) {
            return minorVersion >= 12050;
        }
        return false;
    }
}
