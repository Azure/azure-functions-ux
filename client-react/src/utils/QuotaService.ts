import MakeArmCall from '../ApiHelpers/ArmHelper';
import { QuotaScope, QuotaSettings } from '../models/quotaSettings';
import { ComputeMode } from '../models/site/compute-mode';
import { CommonConstants } from '../utils/CommonConstants';
import { LogCategories } from './LogCategories';
import { getTelemetryInfo } from './TelemetryUtils';

export class QuotaService {
  private static readonly _site = 'site';
  private static readonly _webSpace = 'webspace';
  private static readonly _shared = 'shared';
  private static readonly _dedicated = 'dedicated';
  private static readonly _dynamic = 'dynamic';
  private static readonly _quotaSettingsResourceIdFormat = '/subscriptions/{0}/providers/Microsoft.Web/quotaSettings';
  private static readonly _fullQuotaFormat = '{0}_{1}_{2}_{3}';

  public async getQuotaSettings(subscriptionId: string): Promise<QuotaSettings> {
    const id = QuotaService._quotaSettingsResourceIdFormat.format(subscriptionId);
    // TODO RDBug 12292335:[UR3]Simplify QuotaSettings API
    const quotaSettings = await MakeArmCall<any>({
      resourceId: id,
      commandName: '',
      method: 'GET',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
    });

    if (!quotaSettings.metadata.success) {
      /** @note (joechung): Portal context is unavailable so log errors to console. */
      console.error(getTelemetryInfo('error', LogCategories.quotaService, '/quota-service', { error: quotaSettings.metadata.error }));
    }

    const quotaSettingForCurrentSub = quotaSettings.data.value.first(quota => quota.properties.subscriptionId === subscriptionId);
    return quotaSettingForCurrentSub;
  }

  public async getQuotaLimit(
    subscriptionId: string,
    quotaName: string,
    sku: string,
    computeMode: ComputeMode,
    quotaScope: QuotaScope = QuotaScope.WebSpace
  ): Promise<number | null> {
    const fullQuotaName = this._generateFullQuotaName(quotaName, sku, computeMode, quotaScope);
    if (!fullQuotaName) {
      return null;
    }
    // BUGBUG we should cache quota settings in a JavaScript object lookup instead of array
    // since quota setting doesn’t change that often.
    // Also object lookup is faster than array iteration.
    const quotas = await this.getQuotaSettings(subscriptionId);
    const quota = quotas.properties.quotaSettings.find(qs => qs.key.toLowerCase() === fullQuotaName);
    let quotaLimit = null;
    try {
      if (quota) {
        const quotaValue = JSON.parse(quota.value);
        quotaLimit = quotaValue.Limit;
      }
    } catch (error) {
      /** @note (joechung): Portal context is unavailable for the quota service so log errors to console. */
      console.error(getTelemetryInfo('error', LogCategories.quotaService, '/quota-service', { error }));
    }
    return quotaLimit;
  }

  private _generateFullQuotaName(quotaName: string, sku: string, computeMode: ComputeMode, quotaScope: QuotaScope): string | null {
    const scope: string = quotaScope === QuotaScope.WebSpace ? QuotaService._webSpace : QuotaService._site;
    let mode;
    if (computeMode === ComputeMode.Shared) {
      mode = QuotaService._shared;
    } else if (computeMode === ComputeMode.Dedicated) {
      mode = QuotaService._dedicated;
    } else if (computeMode === ComputeMode.Dynamic) {
      mode = QuotaService._dynamic;
    } else {
      /** @note (joechung): Portal context is unavailable for the quota service so log errors to console. */
      console.error(
        getTelemetryInfo('error', LogCategories.quotaService, '/quota-service', { message: `Unrecognized compute mode ${computeMode}` })
      );
      return null;
    }
    return QuotaService._fullQuotaFormat.format(quotaName, mode, scope, sku).toLowerCase();
  }
}
