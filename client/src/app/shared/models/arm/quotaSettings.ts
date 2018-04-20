export interface QuotaSettings {
    properties: {
        subscriptionId: string,
        quotaSettings: Array<{
            key: string,
            value: string
        }>
    }
}

export enum ComputeMode {
    Shared = 0,
    Dedicated = 1
}

export enum QuotaScope {
    WebSpace = 0,
    Site = 1
}

export class QuotaNames {
    public static readonly useCustomStorageForBackup = 'useCustomStorageForBackup';
    public static readonly numberOfSlotsPerSite = 'NumberOfSlotsPerSite';
    public static readonly numberOfBackups = 'NumberOfBackups';
    public static readonly sslSupport = 'SslSupport';
    public static readonly workerProcess64BitEnabled = 'WorkerProcess64BitEnabled';
    public static readonly webSocketsEnabled = 'WebSocketsEnabled';
    public static readonly alwaysOnEnabled = 'AlwaysOnEnabled';
}