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
    private scmUrl: string;
    private mainSiteUrl: string;
    private useNewUrls: boolean;
    private isEmbeddedFunctions: boolean;

    constructor(private site: ArmObj<Site>, injector: Injector) {

        this.portalService = injector.get(PortalService);
        this.configService = injector.get(ConfigService);

        this.isEmbeddedFunctions = this.portalService.isEmbeddedFunctions;
        this.scmUrl = this.isEmbeddedFunctions ? null : this._getScmUrl(site);
        this.mainSiteUrl = this.isEmbeddedFunctions ? null : this._getMainUrl(site);

        this.useNewUrls = ArmUtil.isLinuxApp(this.site);
    }

    private _getScmUrl(site: ArmObj<Site>) {
        if (this.configService.isStandalone()) {
            return this._getMainUrl(site);
        } else {
            return `https://${site.properties.hostNameSslStates.find(s => s.hostType === 1).name}`;
        }
    }

    private _getMainUrl(site: ArmObj<Site>) {
        if (this.configService.isStandalone()) {
            return `https://${site.properties.defaultHostName}/functions/${site.name}`;
        } else {
            return `https://${site.properties.defaultHostName}`;
        }
    }

    get functionsUrl(): string {
        if (this.isEmbeddedFunctions) {
            return `${ArmEmbeddedService.url}${this.site.id}/functions`;
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
}
