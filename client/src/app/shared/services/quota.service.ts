import { Injectable, Injector } from '@angular/core';
import { CacheService } from 'app/shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import { QuotaSettings, QuotaScope } from 'app/shared/models/arm/quotaSettings';
import { ComputeMode } from 'app/shared/models/arm/site';
import { LogService } from 'app/shared/services/log.service';
import { LogCategories} from 'app/shared/models/constants';
import { ConditionalHttpClient } from 'app/shared/conditional-http-client';
import { UserService } from 'app/shared/services/user.service';

@Injectable()
export class QuotaService {
    private readonly _site = 'site';
    private readonly _webSpace = 'webspace';
    private readonly _shared = 'shared';
    private readonly _dedicated = 'dedicated';
    private readonly _dynamic = 'dynamic';
    private readonly _unrecognized  = 'unrecognized ';
    private readonly _quotaSettingsResourceIdFormat = '/subscriptions/{0}/providers/Microsoft.Web/quotaSettings';
    private readonly _fullQuotaFormat = '{0}_{1}_{2}_{3}';

    private readonly _client: ConditionalHttpClient;

    constructor(
        private _userService: UserService,
        private _cacheService: CacheService,
        private _logService: LogService,
        private _injector: Injector) {
            this._client = new ConditionalHttpClient(this._injector, _ => this._userService.getStartupInfo().map(i => i.token));
    }

    getQuotaSettings(subscriptionId: string):  Observable<QuotaSettings> {
        const resourceId = this._quotaSettingsResourceIdFormat.format(subscriptionId);
        // TODO RDBug 12292335:[UR3]Simplify QuotaSettings API
        const quotaSettings = this._cacheService.getArm(resourceId).map(r => r.json());
        return this._client.execute({ resourceId: resourceId }, t => quotaSettings).map(r => {
            const quotaSettingsForAllSubs: QuotaSettings[] = r.result.value;
            const quotaSettingForCurrentSub = quotaSettingsForAllSubs.find(quota => quota.properties.subscriptionId === subscriptionId);
            return quotaSettingForCurrentSub;
        });
    }

    getQuotaLimit(
        subscriptionId: string,
        quotaName: string,
        sku: string,
        computeMode: ComputeMode,
        quotaScope: QuotaScope = QuotaScope.WebSpace): Observable<number> {
            const fullQuotaName = this._generateFullQuotaName(quotaName, sku, computeMode, quotaScope);
            // BUGBUG we should cache quota settings in a JavaScript object lookup instead of array
            // since quota setting doesn’t change that often.
            // Also object lookup is faster than array iteration.
            return this.getQuotaSettings(subscriptionId).map(quotas => {
                const quota = quotas.properties.quotaSettings.find(qs => qs.key.toLowerCase() === fullQuotaName);
                const quotaValue = JSON.parse(quota.value);
                return quotaValue.Limit;
            });
    }

    private _generateFullQuotaName(
        quotaName: string,
        sku: string,
        computeMode: ComputeMode,
        quotaScope: QuotaScope): string {
            const scope: string = quotaScope === QuotaScope.WebSpace ? this._webSpace : this._site;
            let mode;
            if (computeMode === ComputeMode.Shared) {
                mode = this._shared;
            } else if (computeMode === ComputeMode.Dedicated) {
                mode = this._dedicated;
            } else if (computeMode === ComputeMode.Dynamic) {
                mode = this._dynamic;
            } else {
                mode = this._unrecognized;
                this._logService.error(LogCategories.quotaService, '/quota-service', 'Unrecognized compute mode' + computeMode);
            }
            return this._fullQuotaFormat.format(quotaName, mode, scope, sku).toLowerCase();
    }
}
