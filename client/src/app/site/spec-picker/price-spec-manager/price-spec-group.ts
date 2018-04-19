import { PriceSpec, PriceSpecInput } from './price-spec';
import { FreePlanPriceSpec } from './free-plan-price-spec';
import { SharedPlanPriceSpec } from './shared-plan-price-spec';
import { BasicSmallPlanPriceSpec, BasicMediumPlanPriceSpec, BasicLargePlanPriceSpec, } from './basic-plan-price-spec';
import { StandardSmallPlanPriceSpec, StandardMediumPlanPriceSpec, StandardLargePlanPriceSpec, } from './standard-plan-price-spec';
import { PremiumV2SmallPlanPriceSpec, PremiumV2MediumPlanPriceSpec, PremiumV2LargePlanPriceSpec } from './premiumv2-plan-price-spec';
import { PremiumSmallPlanPriceSpec, PremiumMediumPlanPriceSpec, PremiumLargePlanPriceSpec } from './premium-plan-price-spec';
import { IsolatedSmallPlanPriceSpec, IsolatedMediumPlanPriceSpec, IsolatedLargePlanPriceSpec } from './isolated-plan-price-spec';
import { Injector } from '@angular/core';
import { PortalResources } from '../../../shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';

export abstract class PriceSpecGroup {
    abstract iconUrl: string;
    abstract recommendedSpecs: PriceSpec[];
    abstract specs: PriceSpec[];
    abstract title: string;
    abstract id: string;
    abstract description: string;
    abstract emptyMessage: string;
    abstract emptyInfoLink: string;

    bannerMessage: string;
    selectedSpec: PriceSpec = null;
    isExpanded = false;

    protected ts: TranslateService;

    constructor(protected injector: Injector) {
        this.ts = injector.get(TranslateService);
    }

    abstract initialize(input: PriceSpecInput);
}

export class DevSpecGroup extends PriceSpecGroup {
    recommendedSpecs = [
        new FreePlanPriceSpec(this.injector),
        new SharedPlanPriceSpec(this.injector),
        new BasicSmallPlanPriceSpec(this.injector),
    ];

    specs = [
        new BasicMediumPlanPriceSpec(this.injector),
        new BasicLargePlanPriceSpec(this.injector)
    ];

    selectedSpec = null;
    iconUrl = 'image/tools.svg';
    title = this.ts.instant(PortalResources.pricing_devTestTitle);
    id = 'devtest';
    description = this.ts.instant(PortalResources.pricing_devTestDesc);
    emptyMessage = this.ts.instant(PortalResources.pricing_emptyDevTestGroup);
    emptyInfoLink = 'https://microsoft.com';

    constructor(injector: Injector) {
        super(injector);
    }

    initialize(input: PriceSpecInput) {
        if (input.specPickerInput.data) {
            if (input.specPickerInput.data.isLinux) {
                this.bannerMessage = this.ts.instant(PortalResources.pricing_linuxTrial);
            } else if (input.specPickerInput.data.isXenon) {
                this.bannerMessage = this.ts.instant(PortalResources.pricing_windowsContainers);
            }
        }
    }
}

export class ProdSpecGroup extends PriceSpecGroup {
    recommendedSpecs = [
        new StandardSmallPlanPriceSpec(this.injector),
        new PremiumV2SmallPlanPriceSpec(this.injector),
        new PremiumV2MediumPlanPriceSpec(this.injector),
        new PremiumV2LargePlanPriceSpec(this.injector)
    ];

    specs = [
        new StandardMediumPlanPriceSpec(this.injector),
        new StandardLargePlanPriceSpec(this.injector),
        new PremiumSmallPlanPriceSpec(this.injector),
        new PremiumMediumPlanPriceSpec(this.injector),
        new PremiumLargePlanPriceSpec(this.injector),
    ];

    selectedSpec = null;
    iconUrl = 'image/app-service-plan.svg';
    title = this.ts.instant(PortalResources.pricing_productionTitle);
    id = 'prod';
    description = this.ts.instant(PortalResources.pricing_productionDesc);
    emptyMessage = this.ts.instant(PortalResources.pricing_emptyProdGroup);
    emptyInfoLink = 'https://microsoft.com';

    constructor(injector: Injector) {
        super(injector);
    }

    initialize(input: PriceSpecInput) {
        if (input.specPickerInput.data) {
            if (input.specPickerInput.data.isLinux) {
                this.bannerMessage = this.ts.instant(PortalResources.pricing_linuxTrial);
            } else if (input.specPickerInput.data.isXenon) {
                this.bannerMessage = this.ts.instant(PortalResources.pricing_windowsContainers);
            }
        }
    }
}

export class IsolatedSpecGroup extends PriceSpecGroup {
    recommendedSpecs = [
        new IsolatedSmallPlanPriceSpec(this.injector),
        new IsolatedMediumPlanPriceSpec(this.injector),
        new IsolatedLargePlanPriceSpec(this.injector)
    ];

    specs = [];

    selectedSpec = null;
    iconUrl = 'image/app-service-environment.svg';
    title = this.ts.instant(PortalResources.pricing_isolatedTitle);
    id = 'isolated';
    description = this.ts.instant(PortalResources.pricing_isolatedDesc);
    emptyMessage = this.ts.instant(PortalResources.pricing_emptyIsolatedGroup);
    emptyInfoLink = 'https://microsoft.com';

    constructor(injector: Injector) {
        super(injector);
    }

    initialize(input: PriceSpecInput) {
        if (input.specPickerInput.data && input.specPickerInput.data.isLinux) {
            this.bannerMessage = this.ts.instant(PortalResources.pricing_linuxAseDiscount);
        }
    }
}
