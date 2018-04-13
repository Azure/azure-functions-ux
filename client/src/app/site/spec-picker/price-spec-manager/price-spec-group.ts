import { PriceSpec } from './price-spec';
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
    abstract specs: PriceSpec[];
    abstract title: string;
    abstract description: string;
    abstract emptyMessage: string;
    abstract emptyInfoLink: string;

    selectedSpec: PriceSpec = null;
    isExpanded = false;

    protected ts: TranslateService;

    constructor(protected injector: Injector) {
        this.ts = injector.get(TranslateService);
    }
}

export class DevSpecGroup extends PriceSpecGroup {
    specs = [
        new FreePlanPriceSpec(this.injector),
        new SharedPlanPriceSpec(this.injector),
        new BasicSmallPlanPriceSpec(this.injector),
        new StandardSmallPlanPriceSpec(this.injector),
        new BasicMediumPlanPriceSpec(this.injector),
        new BasicLargePlanPriceSpec(this.injector)
    ];

    selectedSpec = null;
    iconUrl = 'image/tools.svg';
    title = this.ts.instant(PortalResources.pricing_devTestTitle);
    description = this.ts.instant(PortalResources.pricing_devTestDesc);
    emptyMessage = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    emptyInfoLink = 'https://microsoft.com';

    constructor(injector: Injector) {
        super(injector);
    }

}

export class ProdSpecGroup extends PriceSpecGroup {
    specs = [
        new StandardSmallPlanPriceSpec(this.injector),
        new PremiumV2SmallPlanPriceSpec(this.injector),
        new PremiumV2MediumPlanPriceSpec(this.injector),
        new PremiumV2LargePlanPriceSpec(this.injector),
        new StandardMediumPlanPriceSpec(this.injector),
        new PremiumSmallPlanPriceSpec(this.injector),
        new PremiumMediumPlanPriceSpec(this.injector),
        new PremiumLargePlanPriceSpec(this.injector),
        new StandardLargePlanPriceSpec(this.injector)
    ];

    selectedSpec = null;
    iconUrl = 'image/app-service-plan.svg';
    title = this.ts.instant(PortalResources.pricing_productionTitle);
    description = this.ts.instant(PortalResources.pricing_productionDesc);
    emptyMessage = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    emptyInfoLink = 'https://microsoft.com';

    constructor(injector: Injector) {
        super(injector);
    }
}

export class IsolatedSpecGroup extends PriceSpecGroup {
    specs = [
        new IsolatedSmallPlanPriceSpec(this.injector),
        new IsolatedMediumPlanPriceSpec(this.injector),
        new IsolatedLargePlanPriceSpec(this.injector)
    ];

    selectedSpec = null;
    iconUrl = 'image/app-service-environment.svg';
    title = this.ts.instant(PortalResources.pricing_isolatedTitle);
    description = this.ts.instant(PortalResources.pricing_isolatedDesc);

    emptyMessage = this.ts.instant(PortalResources.pricing_emptyIsolatedGroup);
    emptyInfoLink = 'https://microsoft.com';

    constructor(injector: Injector) {
        super(injector);
    }
}
