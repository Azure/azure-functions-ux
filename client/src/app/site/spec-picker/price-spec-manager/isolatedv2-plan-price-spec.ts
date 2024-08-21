import { Injector } from '@angular/core';
import { Kinds, Links, Pricing } from '../../../shared/models/constants';
import { Tier, SkuCode } from '../../../shared/models/serverFarmSku';
import { PortalResources } from '../../../shared/models/portal-resources';
import { AseService } from '../../../shared/services/ase.service';
import { ArmUtil } from '../../../shared/Utilities/arm-utils';
import { AppKind } from '../../../shared/Utilities/app-kind';
import { PriceSpec, PriceSpecInput } from './price-spec';
import { PlanService } from './../../../shared/services/plan.service';
import { ResourceId, Sku } from '../../../shared/models/arm/arm-obj';
import { Observable } from 'rxjs/Rx';

export abstract class IsolatedV2PlanPriceSpec extends PriceSpec {
  tier = Tier.isolatedV2;

  featureItems = [
    {
      iconUrl: 'image/app-service-environment.svg',
      title: this._ts.instant(PortalResources.pricing_ase),
      description: this._ts.instant(PortalResources.pricing_aseDesc),
    },
    {
      iconUrl: 'image/networking.svg',
      title: this._ts.instant(PortalResources.pricing_isolatedNetwork),
      description: this._ts.instant(PortalResources.pricing_isolatedNetworkDesc),
    },
    {
      iconUrl: 'image/active-directory.svg',
      title: this._ts.instant(PortalResources.pricing_privateAppAccess),
      description: this._ts.instant(PortalResources.pricing_privateAppAccessDesc),
    },
    {
      iconUrl: 'image/scale-up.svg',
      title: this._ts.instant(PortalResources.pricing_largeScale),
      description: this._ts.instant(PortalResources.pricing_largeScaleDesc),
    },
    {
      iconUrl: 'image/globe.svg',
      title: this._ts.instant(PortalResources.pricing_trafficManager),
      description: this._ts.instant(PortalResources.pricing_trafficManagerDesc),
    },
  ];

  hardwareItems = [
    {
      iconUrl: 'image/app-service-plan.svg',
      title: this._ts.instant(PortalResources.pricing_includedHardware_azureComputeUnits),
      description: this._ts.instant(PortalResources.pricing_computeDedicatedAcu),
      learnMoreUrl: Links.azureComputeUnitLearnMore,
    },
    {
      iconUrl: 'image/website-power.svg',
      title: this._ts.instant(PortalResources.memory),
      description: this._ts.instant(PortalResources.pricing_dedicatedMemory),
    },
    {
      iconUrl: 'image/storage.svg',
      title: this._ts.instant(PortalResources.storage),
      description: this._ts.instant(PortalResources.pricing_sharedDisk).format('1 TB'),
    },
  ];

  cssClass = 'spec isolated-spec';

  private _aseService: AseService;
  private _planService: PlanService;

  constructor(injector: Injector) {
    super(injector);

    this._aseService = injector.get(AseService);
    this._planService = injector.get(PlanService);
  }

  protected _matchSku(sku: Sku): boolean {
    return sku.tier.toLocaleLowerCase() === this.tier.toLocaleLowerCase() && sku.name.indexOf('v2') > -1;
  }

  private _checkIfSkuEnabledOnStamp(resourceId: ResourceId) {
    if (this.state !== 'hidden') {
      return this._planService.getAvailableSkusForPlan(resourceId).do(availableSkus => {
        this.state = availableSkus.find(s => this._matchSku(s.sku)) ? 'enabled' : 'disabled';

        if (this.state === 'disabled') {
          this.disabledMessage = this._ts.instant(PortalResources.pricing_iv2NotAvailable);
          this.disabledInfoLink = ''; // TODO(shimedh): Get link from Christina.
        }
      });
    }

    return Observable.of(null);
  }

  private _updateHardwareItemsList(isHyperVOrXenon: boolean) {
    if (isHyperVOrXenon) {
      this.hardwareItems.unshift({
        iconUrl: 'image/storage.svg',
        title: this._ts.instant(PortalResources.hyperVIsolation),
        description: this._ts.instant(PortalResources.hyperVIsolationDesc),
      });
    }
  }

  runInitialization(input: PriceSpecInput) {
    if (!ArmUtil.isASEV3GenerallyAccessible()) {
      this.state = 'hidden';
    } else if (input.planDetails) {
      if (!input.planDetails.plan.properties.hostingEnvironmentProfile || AppKind.hasAnyKind(input.planDetails.plan, [Kinds.elastic])) {
        this.state = 'hidden';
      } else {
        return this._aseService.getAse(input.planDetails.plan.properties.hostingEnvironmentProfile.id).do(r => {
          // If the call to get the ASE fails (maybe due to RBAC), then we can't confirm ASE v1 or v2 or v3
          // but we'll let them see the isolated card anyway.  The plan update will probably fail in
          // the back-end if it's ASE v1, but at least we allow real ASE v3 customers who don't have
          // ASE permissions to scale their plan.
          if (r.isSuccessful && r.result.kind && r.result.kind.toLowerCase().indexOf(Kinds.aseV3.toLowerCase()) === -1) {
            this.state = 'hidden';
          } else {
            const { hyperV, isXenon } = input.planDetails.plan.properties;
            this._updateHardwareItemsList(hyperV || isXenon);
          }
        });
      }

      return this._checkIfSkuEnabledOnStamp(input.planDetails && input.planDetails.plan.id).switchMap(_ => {
        return this.checkIfDreamspark(input.subscriptionId);
      });
    } else if (input.specPickerInput.data) {
      if (
        !input.specPickerInput.data.allowAseV3Creation ||
        (input.specPickerInput.data.isNewFunctionAppCreate &&
          (input.specPickerInput.data.isElastic || input.specPickerInput.data.isWorkflowStandard))
      ) {
        this.state = 'hidden';
        return this.checkIfDreamspark(input.subscriptionId);
      } else {
        const { hyperV, isXenon } = input.specPickerInput.data;
        this._updateHardwareItemsList(hyperV || isXenon);
      }
    }

    return Observable.of(null);
  }
}

export class IsolatedV2SmallPlanPriceSpec extends IsolatedV2PlanPriceSpec {
  skuCode = SkuCode.IsolatedV2.I1V2;
  legacySkuName = SkuCode.IsolatedV2.I1V2;
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU_Pv3).format(195),
    this._ts.instant(PortalResources.pricing_memory).format(8),
    this._ts.instant(PortalResources.pricing_vCores).format(2),
  ];

  meterFriendlyName = 'IsolatedV2 Small App Service Hours';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [
      {
        id: this.skuCode,
        quantity: Pricing.hoursInAzureMonth,
        resourceId: null,
      },
    ],
  };

  jbossMultiplier = 2;
}

export class IsolatedV2MediumPlanPriceSpec extends IsolatedV2PlanPriceSpec {
  skuCode = SkuCode.IsolatedV2.I2V2;
  legacySkuName = SkuCode.IsolatedV2.I2V2;
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU_Pv3).format(195),
    this._ts.instant(PortalResources.pricing_memory).format(16),
    this._ts.instant(PortalResources.pricing_vCores).format(4),
  ];

  meterFriendlyName = 'IsolatedV2 Medium App Service Hours';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [
      {
        id: this.skuCode,
        quantity: Pricing.hoursInAzureMonth,
        resourceId: null,
      },
    ],
  };

  jbossMultiplier = 4;
}

export class IsolatedV2LargePlanPriceSpec extends IsolatedV2PlanPriceSpec {
  skuCode = SkuCode.IsolatedV2.I3V2;
  legacySkuName = SkuCode.IsolatedV2.I3V2;
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU_Pv3).format(195),
    this._ts.instant(PortalResources.pricing_memory).format(32),
    this._ts.instant(PortalResources.pricing_vCores).format(8),
  ];

  meterFriendlyName = 'IsolatedV2 Large App Service Hours';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [
      {
        id: this.skuCode,
        quantity: Pricing.hoursInAzureMonth,
        resourceId: null,
      },
    ],
  };

  jbossMultiplier = 8;
}
