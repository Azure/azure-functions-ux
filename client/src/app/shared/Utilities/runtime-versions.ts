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
        const majorVersion = this.majorVersion(exactRuntime);
        const minorVersion = this.minorVersion(exactRuntime);
        if (majorVersion && minorVersion) {
            return majorVersion === 2 && minorVersion >= 12050;
        }
        return false;
    }
}
