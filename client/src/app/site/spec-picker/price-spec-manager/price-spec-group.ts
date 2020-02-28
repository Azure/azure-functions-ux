import { Links } from 'app/shared/models/constants';
import { PriceSpec, PriceSpecInput } from './price-spec';
import { FreePlanPriceSpec } from './free-plan-price-spec';
import { SharedPlanPriceSpec } from './shared-plan-price-spec';
import { BasicSmallPlanPriceSpec, BasicMediumPlanPriceSpec, BasicLargePlanPriceSpec } from './basic-plan-price-spec';
import { StandardSmallPlanPriceSpec, StandardMediumPlanPriceSpec, StandardLargePlanPriceSpec } from './standard-plan-price-spec';
import { PremiumV2SmallPlanPriceSpec, PremiumV2MediumPlanPriceSpec, PremiumV2LargePlanPriceSpec } from './premiumv2-plan-price-spec';
import { PremiumSmallPlanPriceSpec, PremiumMediumPlanPriceSpec, PremiumLargePlanPriceSpec } from './premium-plan-price-spec';
import { IsolatedSmallPlanPriceSpec, IsolatedMediumPlanPriceSpec, IsolatedLargePlanPriceSpec } from './isolated-plan-price-spec';
import {
  PremiumContainerSmallPriceSpec,
  PremiumContainerMediumPriceSpec,
  PremiumContainerLargePriceSpec,
} from './premium-container-plan-price-spec';
import {
  ElasticPremiumSmallPlanPriceSpec,
  ElasticPremiumMediumPlanPriceSpec,
  ElasticPremiumLargePlanPriceSpec,
} from './elastic-premium-plan-price-spec';
import { Injector } from '@angular/core';
import { PortalResources } from '../../../shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { ArmUtil } from '../../../shared/Utilities/arm-utils';
import { PlanPriceSpecManager } from './plan-price-spec-manager';
import { GenericPlanPriceSpec } from './generic-plan-price-spec';
import { PricingTier } from 'app/shared/models/arm/pricingtier';
import { ArmArrayResult } from 'app/shared/models/arm/arm-obj';

export enum BannerMessageLevel {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
  UPSELL = 'upsell',
}

export enum SpecGroup {
  Development = 0,
  Production,
  Isolated,
}

export enum SpecSection {
  Recommended = 0,
  Additional,
}

export interface BannerMessage {
  message: string;
  level: BannerMessageLevel;
  infoLink?: string;
  infoActionIcon?: string;
  infoActionFn?: () => void;
  dismissable?: boolean;
}

export enum PriceSpecGroupType {
  DEV_TEST = 'devtest',
  PROD = 'prod',
  ISOLATED = 'isolated',
}

export abstract class PriceSpecGroup {
  abstract iconUrl: string;
  abstract recommendedSpecs: PriceSpec[];
  abstract additionalSpecs: PriceSpec[];
  abstract title: string;
  abstract id: PriceSpecGroupType;
  abstract description: string;
  abstract emptyMessage: string;
  abstract emptyInfoLink: string;
  emptyInfoLinkText: string;

  bannerMessage: BannerMessage;
  selectedSpec: PriceSpec = null;
  isExpanded = false;

  protected ts: TranslateService;

  constructor(protected injector: Injector, protected specManager: PlanPriceSpecManager) {
    this.ts = injector.get(TranslateService);
    this.emptyInfoLinkText = this.ts.instant(PortalResources.clickToLearnMore);
  }

  abstract initialize(input: PriceSpecInput);
}

export class GenericSpecGroup extends PriceSpecGroup {
  recommendedSpecs = [];

  additionalSpecs = [];

  specGroup: SpecGroup;
  pricingTiers: ArmArrayResult<PricingTier>;

  selectedSpec = null;
  iconUrl: string;
  title: string;
  id: PriceSpecGroupType;
  description: string;
  emptyMessage: string;
  emptyInfoLink: string;

  constructor(injector: Injector, specManager: PlanPriceSpecManager, specGroup: SpecGroup, pricingTiers: ArmArrayResult<PricingTier>) {
    super(injector, specManager);
    this.specGroup = specGroup;
    this.pricingTiers = pricingTiers;
    this._resetSpecGroup();
  }

  initialize(input: PriceSpecInput) {
    this.pricingTiers.value.forEach(pricingTier => {
      if (input.plan) {
        if (input.plan.properties.hyperV !== pricingTier.properties.isXenon) {
          return;
        }
      }
      if (pricingTier.properties.specGroup !== this.specGroup) {
        return;
      }
      if (input.specPickerInput.data) {
        if (input.specPickerInput.data.isLinux !== pricingTier.properties.isLinux) {
          return;
        }
        if (
          input.specPickerInput.data.isXenon !== pricingTier.properties.isXenon &&
          input.specPickerInput.data.hyperV !== pricingTier.properties.isXenon
        ) {
          return;
        }
      }
      const numberOfWorkersRequired = (input.plan && input.plan.properties.numberOfWorkers) || 1;
      const spec = new GenericPlanPriceSpec(this.injector, pricingTier.properties);
      if ((!input.plan || input.plan.sku.name !== spec.skuCode) && pricingTier.properties.availableInstances < numberOfWorkersRequired) {
        spec.state = 'disabled';
        spec.disabledMessage = this.ts.instant(PortalResources.pricing_notEnoughInstances);
      } else {
        spec.state = 'enabled';
      }
      if (pricingTier.properties.specSection === SpecSection.Recommended) {
        this.recommendedSpecs.push(spec);
      } else {
        this.additionalSpecs.push(spec);
      }
    });
  }

  private _resetSpecGroup() {
    this.emptyInfoLink = Links.appServicePricing;
    if (this.specGroup === SpecGroup.Development) {
      this.iconUrl = 'image/tools.svg';
      this.title = this.ts.instant(PortalResources.pricing_devTestTitle);
      this.id = PriceSpecGroupType.DEV_TEST;
      this.description = this.ts.instant(PortalResources.pricing_devTestDesc);
      this.emptyMessage = this.ts.instant(PortalResources.pricing_emptyDevTestGroup);
    } else if (this.specGroup === SpecGroup.Production) {
      this.iconUrl = 'image/app-service-plan.svg';
      this.title = this.ts.instant(PortalResources.pricing_productionTitle);
      this.id = PriceSpecGroupType.PROD;
      this.description = this.ts.instant(PortalResources.pricing_productionDesc);
      this.emptyMessage = this.ts.instant(PortalResources.pricing_emptyProdGroup);
    } else if (this.specGroup === SpecGroup.Isolated) {
      this.iconUrl = 'image/app-service-environment.svg';
      this.title = this.ts.instant(PortalResources.pricing_isolatedTitle);
      this.id = PriceSpecGroupType.ISOLATED;
      this.description = this.ts.instant(PortalResources.pricing_isolatedDesc);
      this.emptyMessage = this.ts.instant(PortalResources.pricing_emptyIsolatedGroup);
    }
  }
}

export class DevSpecGroup extends PriceSpecGroup {
  recommendedSpecs = [
    new FreePlanPriceSpec(this.injector),
    new SharedPlanPriceSpec(this.injector),
    new BasicSmallPlanPriceSpec(this.injector),
  ];
  additionalSpecs = [new BasicMediumPlanPriceSpec(this.injector), new BasicLargePlanPriceSpec(this.injector)];

  selectedSpec = null;
  iconUrl = 'image/tools.svg';
  title = this.ts.instant(PortalResources.pricing_devTestTitle);
  id = PriceSpecGroupType.DEV_TEST;
  description = this.ts.instant(PortalResources.pricing_devTestDesc);
  emptyMessage = this.ts.instant(PortalResources.pricing_emptyDevTestGroup);
  emptyInfoLink = Links.appServicePricing;

  constructor(injector: Injector, specManager: PlanPriceSpecManager) {
    super(injector, specManager);
  }

  initialize(input: PriceSpecInput) {
    if (input.specPickerInput.data) {
      if (input.specPickerInput.data.isLinux) {
        this.bannerMessage = {
          message: this.ts.instant(PortalResources.pricing_linuxTrial),
          level: BannerMessageLevel.INFO,
        };
      } else if (input.specPickerInput.data.isXenon || input.specPickerInput.data.hyperV) {
        this.bannerMessage = {
          message: this.ts.instant(PortalResources.pricing_windowsContainers),
          level: BannerMessageLevel.INFO,
          infoLink: 'https://go.microsoft.com/fwlink/?linkid=2009013',
        };
      }
    }
  }
}

export class ProdSpecGroup extends PriceSpecGroup {
  recommendedSpecs = [
    new PremiumV2SmallPlanPriceSpec(this.injector, this.specManager),
    new PremiumV2MediumPlanPriceSpec(this.injector, this.specManager),
    new PremiumV2LargePlanPriceSpec(this.injector, this.specManager),
    new PremiumContainerSmallPriceSpec(this.injector),
    new PremiumContainerMediumPriceSpec(this.injector),
    new PremiumContainerLargePriceSpec(this.injector),
    new ElasticPremiumSmallPlanPriceSpec(this.injector),
    new ElasticPremiumMediumPlanPriceSpec(this.injector),
    new ElasticPremiumLargePlanPriceSpec(this.injector),
  ];

  additionalSpecs = [
    new StandardMediumPlanPriceSpec(this.injector),
    new StandardLargePlanPriceSpec(this.injector),
    new PremiumSmallPlanPriceSpec(this.injector),
    new PremiumMediumPlanPriceSpec(this.injector),
    new PremiumLargePlanPriceSpec(this.injector),
  ];

  selectedSpec = null;
  iconUrl = 'image/app-service-plan.svg';
  title = this.ts.instant(PortalResources.pricing_productionTitle);
  id = PriceSpecGroupType.PROD;
  description = this.ts.instant(PortalResources.pricing_productionDesc);
  emptyMessage = this.ts.instant(PortalResources.pricing_emptyProdGroup);
  emptyInfoLink = Links.appServicePricing;

  constructor(injector: Injector, specManager: PlanPriceSpecManager) {
    super(injector, specManager);
  }

  initialize(input: PriceSpecInput) {
    if (input.specPickerInput.data) {
      if (input.specPickerInput.data.isLinux) {
        this.bannerMessage = {
          message: this.ts.instant(PortalResources.pricing_linuxTrial),
          level: BannerMessageLevel.INFO,
        };
      } else if (input.specPickerInput.data.isXenon || input.specPickerInput.data.hyperV) {
        this.bannerMessage = {
          message: this.ts.instant(PortalResources.pricing_windowsContainers),
          level: BannerMessageLevel.INFO,
          infoLink: 'https://go.microsoft.com/fwlink/?linkid=2009013',
        };
      }
    }

    // NOTE(michinoy): The OS type determines whether standard small plan is recommended or additional pricing tier.
    if ((input.specPickerInput.data && input.specPickerInput.data.isLinux) || ArmUtil.isLinuxApp(input.plan)) {
      this.additionalSpecs.unshift(new StandardSmallPlanPriceSpec(this.injector));
    } else {
      this.recommendedSpecs.unshift(new StandardSmallPlanPriceSpec(this.injector));
    }
  }
}

export class IsolatedSpecGroup extends PriceSpecGroup {
  recommendedSpecs = [
    new IsolatedSmallPlanPriceSpec(this.injector),
    new IsolatedMediumPlanPriceSpec(this.injector),
    new IsolatedLargePlanPriceSpec(this.injector),
  ];

  additionalSpecs = [];

  selectedSpec = null;
  iconUrl = 'image/app-service-environment.svg';
  title = this.ts.instant(PortalResources.pricing_isolatedTitle);
  id = PriceSpecGroupType.ISOLATED;
  description = this.ts.instant(PortalResources.pricing_isolatedDesc);
  emptyMessage = this.ts.instant(PortalResources.pricing_emptyIsolatedGroup);
  emptyInfoLink = Links.appServicePricing;

  constructor(injector: Injector, specManager: PlanPriceSpecManager) {
    super(injector, specManager);
  }

  initialize(input: PriceSpecInput) {}
}
