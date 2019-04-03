import { PriceSpec, PriceSpecInput } from './PriceSpec';
import { PricingTier } from '../../../../models/pricingtier';
import i18next from 'i18next';
import { ComputeMode } from '../../../../models/site/compute-mode';

export abstract class GenericPlanPriceSpec extends PriceSpec {
  private static readonly colorToCssSpec = {
    darkOrchid: 'spec premium-spec',
    mediumBlue: 'spec standard-spec',
    yellowGreen: 'spec basic-spec',
    orange: 'spec free-spec',
  };

  private _computeMode?: number;

  constructor(t: i18next.TFunction, pricingTier: PricingTier) {
    super(t);
    this.legacySkuName = pricingTier.name;
    this.skuCode = pricingTier.name;
    this.tier = pricingTier.workerTierName;
    this._computeMode = pricingTier.computeMode;
    if (pricingTier.estimatedPrice === 0) {
      this.priceString = t('free');
    } else if (pricingTier.estimatedPrice > 0) {
      this.priceString = this.priceIsBaseline
        ? t('pricing_pricePerMonthBaseline').format(pricingTier.estimatedPrice, pricingTier.currencyCode)
        : t('pricing_pricePerMonth').format(pricingTier.estimatedPrice, pricingTier.currencyCode);
    } else {
      this.priceString = ' ';
    }
    this.cssClass = GenericPlanPriceSpec.colorToCssSpec[pricingTier.skuSettings];
    this.topLevelFeatures.push(t('pricing_memory').format(pricingTier.memorySize / 1024));
    this.topLevelFeatures.push(t('pricing_computeVmSize').format(`${pricingTier.computeVmSize}`));

    this._setFeatureItems(t, pricingTier);
    this._sethardwareItems(t, pricingTier);
  }

  public async runInitialization(input: PriceSpecInput): Promise<void> {
    if (input.specPickerInput && input.specPickerInput.data && input.specPickerInput.data.forbiddenComputeMode === this._computeMode) {
      this.state = 'hidden';
    }
  }

  private _setFeatureItems(t: i18next.TFunction, pricingTier: PricingTier) {
    if (pricingTier.customDomainsEnabled) {
      this.featureItems.push({
        id: 'feature_customDomainsName',
        iconUrl: 'image/ssl.svg',
        title: t('pricing_customDomainsSsl'),
        description: t('pricing_customDomainsSslDesc'),
      });
    }

    if (pricingTier.numberOfWorkersPerSite !== 0) {
      this.featureItems.push({
        id: 'pricing_autoScale',
        iconUrl: 'image/scale-up.svg',
        title: t('pricing_scaleOut'),
        description: (pricingTier.numberOfWorkersPerSite < 0 ? t('pricing_scaleDescUnlimited') : t('pricing_scaleDesc')).format(
          pricingTier.numberOfWorkersPerSite
        ),
      });
    }

    if (pricingTier.numberOfSlotsPerSite > 1) {
      this.featureItems.push({
        id: 'pricing_stagingSlots',
        iconUrl: 'image/slots.svg',
        title: t('pricing_stagingSlots'),
        description: t('pricing_slotsDesc').format(pricingTier.numberOfSlotsPerSite),
      });
    }

    if (pricingTier.numberOfBackups && pricingTier.backupPeriodHours) {
      const backupPerDays = (pricingTier.numberOfBackups / pricingTier.backupPeriodHours) * 24;
      backupPerDays.toFixed();
      this.featureItems.push({
        id: 'pricing_dailyBackups',
        iconUrl: 'image/backups.svg',
        title: t('pricing_dailyBackups'),
        description: t('pricing_dailyBackupDesc').format(backupPerDays.toFixed()),
      });
    }
  }

  private _sethardwareItems(t: i18next.TFunction, pricingTier: PricingTier) {
    this.hardwareItems.push({
      id: 'storage',
      iconUrl: 'image/storage.svg',
      title: t('storage'),
      description: t('pricing_sharedDisk').format(`${pricingTier.fileSystemStorageInMB}/1024 GB`),
    });

    this.hardwareItems.push({
      id: 'memory',
      iconUrl: 'image/website-power.svg',
      title: t('memory'),
      description: pricingTier.computeMode === ComputeMode.Shared ? t('pricing_sharedMemory') : t('pricing_dedicatedMemory'),
    });
  }
}
