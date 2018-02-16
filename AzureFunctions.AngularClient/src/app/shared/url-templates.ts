import { ArmService } from 'app/shared/services/arm.service';
import { ArmEmbeddedService } from './services/arm-embedded.service';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { ConfigService } from 'app/shared/services/config.service';
import { PortalService } from './services/portal.service';
import { Injector } from '@angular/core';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';

export class UrlTemplates {
    private configService: ConfigService;
    private portalService: PortalService;
    private armService: ArmService;
    private scmUrl: string;
    private mainSiteUrl: string;
    private useNewUrls: boolean;
    private isEmbeddedFunctions: boolean;

    constructor(private site: ArmObj<Site>, injector: Injector) {

        this.portalService = injector.get(PortalService);
        this.configService = injector.get(ConfigService);
        this.armService = injector.get(ArmService);

        this.isEmbeddedFunctions = this.portalService.isEmbeddedFunctions;
        this.scmUrl = this.isEmbeddedFunctions ? null : this.getScmUrl();
        this.mainSiteUrl = this.isEmbeddedFunctions ? null : this.getMainUrl();

        this.useNewUrls = ArmUtil.isLinuxApp(this.site);
    }

    public getScmUrl() {
        if (this.configService.isStandalone()) {
            return this.getMainUrl();
        } else if (this.isEmbeddedFunctions) {
            return null;
        } else {
            const scmHostName = this.site.properties.hostNameSslStates.find(s => s.hostType === 1);
            return scmHostName ? `https://${scmHostName.name}` : this.getMainUrl();
        }
    }

    public getMainUrl() {
        if (this.configService.isStandalone()) {
            return `https://${this.site.properties.defaultHostName}/functions/${this.site.name}`;
        } else if (this.isEmbeddedFunctions) {
            return null;
        } else {
            return `https://${this.site.properties.defaultHostName}`;
        }
    }

    get functionsUrl(): string {
        if (this.isEmbeddedFunctions) {
            const parts = this.site.id.split('/').filter(part => !!part);

            if (parts.length === 6) {
                // url to get all functions for the environment: removes "/scopes/cds"
                const smallerSiteId = this.site.id.split('/').filter(part => !!part).slice(0, 4).join('/');
                return `${ArmEmbeddedService.url}/${smallerSiteId}/functions?api-version=${this.armService.websiteApiVersion}`;
            }
            // url to get all functions for the entity
            return `${ArmEmbeddedService.url}${this.site.id}/functions?api-version=${this.armService.websiteApiVersion}`;
        }

        return this.useNewUrls
            ? `${this.mainSiteUrl}/admin/functions`
            : `${this.scmUrl}/api/functions`;
    }

    get proxiesJsonUrl(): string {
        return this.useNewUrls
            ? `${this.mainSiteUrl}/admin/vfs/site/wwwroot/proxies.json`
            : `${this.scmUrl}/api/vfs/site/wwwroot/proxies.json`;
    }

    getFunctionUrl(functionName: string, functionEntity?: string): string {
        if (this.isEmbeddedFunctions) {
            if (!!functionEntity) {
                const smallerSiteId = this.site.id.split('/').filter(part => !!part).slice(0, 6).join('/');
                return `${ArmEmbeddedService.url}/${smallerSiteId}/entities/${functionEntity}/functions/${functionName}?api-version=${this.armService.websiteApiVersion}`;
            }
            return `${ArmEmbeddedService.url}${this.site.id}/functions/${functionName}?api-version=${this.armService.websiteApiVersion}`;
        }

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
