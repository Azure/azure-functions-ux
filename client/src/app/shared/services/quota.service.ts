import { Injectable } from '@angular/core';
import { CacheService } from 'app/shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import { QuotaSettings, ComputeMode, QuotaScope } from 'app/shared/models/arm/quotaSettings';


@Injectable()
export class QuotaService {
    private readonly _site = 'site';
    private readonly _webSpace = 'webspace';
    private readonly _shared = 'shared';
    private readonly _dedicated = 'dedicated';
    private readonly _quotaSettingsResourceIdFormat = '/subscriptions/{0}/providers/Microsoft.Web/quotaSettings';
    private readonly _fullQuotaFormat = '{0}_{1}_{2}_{3}';

    constructor(
        private _cacheService: CacheService) {
    }

    getQuotaSettings(subscriptionId: string):  Observable<QuotaSettings> {
        const resourceId = this._quotaSettingsResourceIdFormat.format(subscriptionId);
        return  this._cacheService.getArm(resourceId).map(r => {
            const quotaSettingsForAllSubs: QuotaSettings[] = r.json().value;
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
            const fullQuotaName = this.generateFullQuotaName(quotaName, sku, computeMode, quotaScope);
            // BUGBUG we should cache quota settings in a JavaScript object lookup instead of array
            // since quota setting doesn’t change that often.
            // Also object lookup is faster than array iteration.
            return this.getQuotaSettings(subscriptionId).map(quotaSetting => {
                const quota = quotaSetting.properties.quotaSettings.find(qs => qs.key.toLowerCase() === fullQuotaName);
                const quotaValue = JSON.parse(quota.value);
                return quotaValue.Limit;
            });
    }

    private generateFullQuotaName(
        quotaName: string,
        sku: string,
        computeMode: ComputeMode,
        quotaScope: QuotaScope): string {
            const scope: string = quotaScope === QuotaScope.WebSpace ? this._webSpace : this._site;
            const mode = computeMode === ComputeMode.Shared ? this._shared : this._dedicated;
            return this._fullQuotaFormat.format(quotaName, mode, scope, sku).toLowerCase();
    }
}
