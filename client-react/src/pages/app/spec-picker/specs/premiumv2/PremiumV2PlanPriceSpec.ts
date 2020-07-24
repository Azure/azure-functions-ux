import { ArmSku, ArmObj } from './../../../../../models/arm-obj';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../../utils/AppKind';
import { PlanSpecPickerData, SpecColorCodes } from '../PriceSpec';
import { style } from 'typestyle';
import { DV2SeriesPriceSpec } from '../DV2SeriesPriceSpec';
import i18next from 'i18next';
import { ServerFarm } from '../../../../../models/serverFarm/serverfarm';
import { Links } from '../../../../../utils/FwLinks';

export abstract class PremiumV2PlanPriceSpec extends DV2SeriesPriceSpec {
  constructor(t: i18next.TFunction) {
    super(t, ServerFarmSkuConstants.Tier.premiumV2, t('pricing_pv2NotAvailable'), Links.premiumV2NotAvailableLearnMore);
    this.tier = ServerFarmSkuConstants.Tier.premiumV2;
    this.featureItems = [
      {
        id: 'pricing_customDomainsSsl',
        iconUrl: 'image/ssl.svg',
        title: t('pricing_customDomainsSsl'),
        description: t('pricing_customDomainsIpSslDesc'),
      },
      {
        id: 'pricing_autoScale',
        iconUrl: 'image/scale-up.svg',
        title: t('pricing_autoScale'),
        description: t('pricing_scaleDesc').format(20),
      },
      {
        id: 'pricing_stagingSlots',
        iconUrl: 'image/slots.svg',
        title: t('pricing_stagingSlots'),
        description: t('pricing_slotsDesc').format(20),
      },
      {
        id: 'pricing_dailyBackups',
        iconUrl: 'image/backups.svg',
        title: t('pricing_dailyBackups'),
        description: t('pricing_dailyBackupDesc').format(50),
      },
      {
        id: 'pricing_trafficManager',
        iconUrl: 'image/globe.svg',
        title: t('pricing_trafficManager'),
        description: t('pricing_trafficManagerDesc'),
      },
    ];

    this.hardwareItems = [
      {
        id: 'pricing_includedHardware_azureComputeUnits',
        iconUrl: 'image/app-service-plan.svg',
        title: t('pricing_includedHardware_azureComputeUnits'),
        description: t('pricing_computeDedicatedAcu'),
        learnMoreUrl: Links.azureComputeUnitLearnMore,
      },
      {
        id: 'memory',
        iconUrl: 'image/website-power.svg',
        title: t('memory'),
        description: t('pricing_dedicatedMemory'),
      },
      {
        id: 'storage',
        iconUrl: 'image/storage.svg',
        title: t('storage'),
        description: t('pricing_sharedDisk').format('250 GB'),
      },
    ];

    this.cssClass = style({
      background: SpecColorCodes.PREMIUM,
    });
  }

  protected _matchSku(sku: ArmSku): boolean {
    return sku.name.indexOf('v2') > -1;
  }

  protected _shouldHideForNewPlan(data: PlanSpecPickerData): boolean {
    return !!data.hostingEnvironmentName || data.isXenon || data.hyperV || (!!data.isNewFunctionAppCreate && !!data.isElastic);
  }

  protected _shouldHideForExistingPlan(plan: ArmObj<ServerFarm>): boolean {
    return (
      !!plan.properties.hostingEnvironmentProfile || plan.properties.hyperV || AppKind.hasAnyKind(plan, [CommonConstants.Kinds.elastic])
    );
  }
}
