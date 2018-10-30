import { Injectable, Injector } from '@angular/core';
import { CacheService } from 'app/shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import { QuotaSettings, QuotaScope } from 'app/shared/models/arm/quotaSettings';
import { ComputeMode } from 'app/shared/models/arm/site';
import { LogService } from 'app/shared/services/log.service';
import { LogCategories } from 'app/shared/models/constants';
import { ConditionalHttpClient } from 'app/shared/conditional-http-client';
import { UserService } from 'app/shared/services/user.service';

@Injectable()
export class QuotaService {
  private static readonly _site = 'site';
  private static readonly _webSpace = 'webspace';
  private static readonly _shared = 'shared';
  private static readonly _dedicated = 'dedicated';
  private static readonly _dynamic = 'dynamic';
  private static readonly _quotaSettingsResourceIdFormat = '/subscriptions/{0}/providers/Microsoft.Web/quotaSettings';
  private static readonly _fullQuotaFormat = '{0}_{1}_{2}_{3}';

  private readonly _client: ConditionalHttpClient;

  constructor(userService: UserService, private _cacheService: CacheService, private _logService: LogService, injector: Injector) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  getQuotaSettings(subscriptionId: string): Observable<QuotaSettings> {
    const resourceId = QuotaService._quotaSettingsResourceIdFormat.format(subscriptionId);
    // TODO RDBug 12292335:[UR3]Simplify QuotaSettings API
    const quotaSettings = this._cacheService.getArm(resourceId).map(r => r.json());
    return this._client.execute({ resourceId: resourceId }, t => quotaSettings).map(r => {
      if (!r.isSuccessful) {
        this._logService.error(LogCategories.quotaService, '/quota-service', r.error);
        return null;
      }
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
    quotaScope: QuotaScope = QuotaScope.WebSpace
  ): Observable<number> {
    const fullQuotaName = this._generateFullQuotaName(quotaName, sku, computeMode, quotaScope);
    if (!fullQuotaName) {
      return null;
    }
    // BUGBUG we should cache quota settings in a JavaScript object lookup instead of array
    // since quota setting doesn’t change that often.
    // Also object lookup is faster than array iteration.
    return this.getQuotaSettings(subscriptionId).map(quotas => {
      const quota = quotas.properties.quotaSettings.find(qs => qs.key.toLowerCase() === fullQuotaName);
      let quotaLimit: number = null;
      try {
        const quotaValue = JSON.parse(quota.value);
        quotaLimit = quotaValue.Limit;
      } catch (e) {
        this._logService.error(LogCategories.quotaService, '/quota-service', e);
      }
      return quotaLimit;
    });
  }

  private _generateFullQuotaName(quotaName: string, sku: string, computeMode: ComputeMode, quotaScope: QuotaScope): string {
    const scope: string = quotaScope === QuotaScope.WebSpace ? QuotaService._webSpace : QuotaService._site;
    let mode;
    if (computeMode === ComputeMode.Shared) {
      mode = QuotaService._shared;
    } else if (computeMode === ComputeMode.Dedicated) {
      mode = QuotaService._dedicated;
    } else if (computeMode === ComputeMode.Dynamic) {
      mode = QuotaService._dynamic;
    } else {
      this._logService.error(LogCategories.quotaService, '/quota-service', 'Unrecognized compute mode' + computeMode);
      return null;
    }
    return QuotaService._fullQuotaFormat.format(quotaName, mode, scope, sku).toLowerCase();
  }
}
