export class UrlTemplates {

    constructor(private scmUrl: string,
        private mainSiteUrl: string,
        private useNewUrls: boolean) {
    }

    get functionsUrl(): string {
        return this.useNewUrls
            ? `${this.mainSiteUrl}/admin/functions`
            : `${this.scmUrl}/api/functions`;
    }

    get proxiesJsonUrl(): string {
        return this.useNewUrls
            ? `${this.mainSiteUrl}/admin/vfs/site/wwwroot/proxies.json`
            : `${this.scmUrl}/api/vfs/site/wwwroot/proxies.json`;
    }

    getFunctionUrl(functionName: string): string {
        return this.useNewUrls
            ? `${this.mainSiteUrl}/admin/functions/${functionName}`
            : `${this.scmUrl}/api/functions/${functionName}`;
    }

    get scmSettingsUrl(): string {
        return `${this.scmUrl}/api/settings`;
    }

    getRunFunctionUrl(functionName: string): string {
        return `${this.mainSiteUrl}/admin/functions/${functionName.toLocaleLowerCase()}`;
    }

    get pingUrl(): string {
        return `${this.mainSiteUrl}/admin/host/ping`;
    }

    get hostJsonUrl(): string {
        return this.useNewUrls
            ? `${this.mainSiteUrl}/admin/vfs/home/site/wwwroot/host.json`
            : `${this.scmUrl}/api/functions/config`;
    }

    get scmTokenUrl(): string {
        return `${this.scmUrl}/api/functions/admin/token`;
    }

    get masterKeyUrl(): string {
        return `${this.mainSiteUrl}/admin/host/systemkeys/_master`;
    }

    get deprecatedKuduMasterKeyUrl(): string {
        return `${this.scmUrl}/api/functions/admin/masterKey`;
    }

    get runtimeStatusUrl(): string {
        return `${this.mainSiteUrl}/admin/host/status`;
    }

    get legacyGetHostSecretsUrl(): string {
        return `${this.scmUrl}/api/vfs/data/functions/secrets/host.json`;
    }

    get adminKeysUrl(): string {
        return `${this.mainSiteUrl}/admin/host/keys`;
    }

    getFunctionRuntimeErrorsUrl(functionName: string): string {
        return `${this.mainSiteUrl}/admin/functions/${functionName}/status`;
    }

    getFunctionLogUrl(functionName: string): string {
        return `${this.scmUrl}/api/vfs/logfiles/application/functions/function/${functionName}/`;
    }

    getFunctionKeysUrl(functionName: string): string {
        return `${this.mainSiteUrl}/admin/functions/${functionName}/keys`;
    }

    getFunctionKeyUrl(functionName: string, keyName: string): string {
        return `${this.mainSiteUrl}/admin/functions/${functionName}/keys/${keyName}`;
    }

    getAdminKeyUrl(keyName: string): string {
        return `${this.mainSiteUrl}/admin/host/keys/${keyName}`;
    }

    get syncTriggersUrl(): string {
        return `${this.scmUrl}/api/functions/synctriggers`;
    }

    get pingScmSiteUrl(): string {
        return this.scmUrl;
    }

    get systemKeysUrl(): string {
        return `${this.mainSiteUrl}/admin/host/systemkeys`;
    }

    getSystemKeyUrl(keyName: string): string {
        return `${this.mainSiteUrl}/admin/host/systemkeys/${keyName}`;
    }

    get runtimeHostExtensionsUrl(): string {
        return `${this.mainSiteUrl}/admin/host/extensions`;
    }

    getRuntimeHostExtensionsJobStatusUrl(jobId: string): string {
        return `${this.mainSiteUrl}/admin/host/extensions/jobs/${jobId}`;
    }

    get scmSiteUrl(): string {
        return this.scmUrl;
    }

    get runtimeSiteUrl(): string {
        return this.mainSiteUrl;
    }

    get getGeneratedSwaggerDataUrl(): string {
        return `${this.mainSiteUrl}/admin/host/swagger/default`;
    }

    get getSwaggerDocumentUrl() {
        return `${this.mainSiteUrl}/admin/host/swagger`;
    }
}
