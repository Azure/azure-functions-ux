import { PriceSpec, PriceSpecInput } from './price-spec';
import { PricingTier } from 'app/shared/models/arm/pricingtier';
import { Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PortalResources } from 'app/shared/models/portal-resources';
import { ComputeMode } from 'app/shared/models/arm/site';

export class GenericPlanPriceSpec extends PriceSpec {
  skuCode = '';
  tier = '';
  legacySkuName = '';
  topLevelFeatures = [];
  featureItems = [];
  hardwareItems = [];
  specResourceSet = null;
  computeMode?: ComputeMode = null;

  private static readonly colorToCssSpec = {
    darkOrchid: 'spec premium-spec',
    mediumBlue: 'spec standard-spec',
    yellowGreen: 'spec basic-spec',
    orange: 'spec free-spec',
  };

  meterFriendlyName = 'App Service';
  runInitialization(input: PriceSpecInput): Observable<void> {
    if (input.specPickerInput && input.specPickerInput.data && input.specPickerInput.data.forbiddenComputeMode === this.computeMode) {
      this.state = 'hidden';
    }
    return Observable.of(null);
  }

  constructor(injector: Injector, pricingTier: PricingTier) {
    super(injector);
    this.legacySkuName = pricingTier.name;
    this.skuCode = pricingTier.name;
    this.tier = pricingTier.workerTierName;
    this.computeMode = pricingTier.computeMode;
    if (pricingTier.estimatedPrice === 0) {
      this.priceString = this._ts.instant(PortalResources.free);
    } else if (pricingTier.estimatedPrice > 0) {
      this.priceString = this._ts
        .instant(PortalResources.pricing_pricePerMonth)
        .format(pricingTier.estimatedPrice, pricingTier.currencyCode);
    } else {
      this.priceString = ' ';
    }
    this.cssClass = GenericPlanPriceSpec.colorToCssSpec[pricingTier.skuSettings];
    this.topLevelFeatures.push(this._ts.instant(PortalResources.pricing_memory).format(pricingTier.memorySize / 1024));
    this.topLevelFeatures.push(this._ts.instant(PortalResources.pricing_computeVmSize).format(pricingTier.computeVmSize + ''));

    this._setFeatureItems(pricingTier);
    this._sethardwareItems(pricingTier);
  }

  private _setFeatureItems(pricingTier: PricingTier) {
    if (pricingTier.customDomainsEnabled) {
      this.featureItems.push({
        iconUrl: 'image/ssl.svg',
        title: this._ts.instant(PortalResources.pricing_customDomainsSsl),
        description: this._ts.instant(PortalResources.pricing_customDomainsSslDesc),
      });
    }

    if (pricingTier.numberOfWorkersPerSite !== 0) {
      this.featureItems.push({
        iconUrl: 'image/scale-up.svg',
        title: this._ts.instant(PortalResources.pricing_scaleOut),
        description: this._ts
          .instant(pricingTier.numberOfWorkersPerSite < 0 ? PortalResources.pricing_scaleDescUnlimited : PortalResources.pricing_scaleDesc)
          .format(pricingTier.numberOfWorkersPerSite),
      });
    }

    if (pricingTier.numberOfSlotsPerSite > 1) {
      this.featureItems.push({
        iconUrl: 'image/slots.svg',
        title: this._ts.instant(PortalResources.pricing_stagingSlots),
        description: this._ts.instant(PortalResources.pricing_slotsDesc).format(pricingTier.numberOfSlotsPerSite),
      });
    }

    if (pricingTier.numberOfBackups && pricingTier.backupPeriodHours) {
      const backupPerDays = (pricingTier.numberOfBackups / pricingTier.backupPeriodHours) * 24;
      backupPerDays.toFixed();
      this.featureItems.push({
        iconUrl: 'image/backups.svg',
        title: this._ts.instant(PortalResources.pricing_dailyBackups),
        description: this._ts.instant(PortalResources.pricing_dailyBackupDesc).format(backupPerDays.toFixed()),
      });
    }
  }

  private _sethardwareItems(pricingTier: PricingTier) {
    this.hardwareItems.push({
      iconUrl: 'image/storage.svg',
      title: this._ts.instant(PortalResources.storage),
      description: this._ts.instant(PortalResources.pricing_sharedDisk).format(pricingTier.fileSystemStorageInMB / 1024 + ' GB'),
    });

    this.hardwareItems.push({
      iconUrl: 'image/website-power.svg',
      title: this._ts.instant(PortalResources.memory),
      description: this._ts.instant(
        pricingTier.computeMode === ComputeMode.Shared ? PortalResources.pricing_sharedMemory : PortalResources.pricing_dedicatedMemory
      ),
    });
  }
}
