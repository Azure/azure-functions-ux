import { PriceSpec } from './price-spec';
import { FreePlanPriceSpec } from './free-plan-price-spec';
import { SharedPlanPriceSpec } from './shared-plan-price-spec';
import { BasicSmallPlanPriceSpec, BasicMediumPlanPriceSpec, BasicLargePlanPriceSpec, } from './basic-plan-price-spec';
import { StandardSmallPlanPriceSpec, StandardMediumPlanPriceSpec, StandardLargePlanPriceSpec, } from './standard-plan-price-spec';
import { PremiumV2SmallPlanPriceSpec, PremiumV2MediumPlanPriceSpec, PremiumV2LargePlanPriceSpec } from './premiumv2-plan-price-spec';
import { PremiumSmallPlanPriceSpec, PremiumMediumPlanPriceSpec, PremiumLargePlanPriceSpec } from './premium-plan-price-spec';
import { IsolatedSmallPlanPriceSpec, IsolatedMediumPlanPriceSpec, IsolatedLargePlanPriceSpec } from './isolated-plan-price-spec';
import { Injector } from '@angular/core';

export interface PriceSpecGroup {
    iconUrl: string;
    specs: PriceSpec[];
    selectedSpec: PriceSpec;
    title: string;
    description: string;
    isExpanded: boolean;
}

export class DevSpecGroup implements PriceSpecGroup {
    specs = [
        new FreePlanPriceSpec(this._injector),
        new SharedPlanPriceSpec(this._injector),
        new BasicSmallPlanPriceSpec(this._injector),
        new StandardSmallPlanPriceSpec(this._injector),
        new BasicMediumPlanPriceSpec(this._injector),
        new BasicLargePlanPriceSpec(this._injector)
    ];

    selectedSpec = null;
    iconUrl = 'image/tools.svg';
    title = 'Dev / Test';
    description = 'For less demanding workloads';
    isExpanded = false;

    constructor(private _injector: Injector) { }

}

export class ProdSpecGroup implements PriceSpecGroup {
    specs = [
        new StandardSmallPlanPriceSpec(this._injector),
        new PremiumV2SmallPlanPriceSpec(this._injector),
        new PremiumV2MediumPlanPriceSpec(this._injector),
        new PremiumV2LargePlanPriceSpec(this._injector),
        new StandardMediumPlanPriceSpec(this._injector),
        new PremiumSmallPlanPriceSpec(this._injector),
        new PremiumMediumPlanPriceSpec(this._injector),
        new PremiumLargePlanPriceSpec(this._injector),
        new StandardLargePlanPriceSpec(this._injector)
    ];

    selectedSpec = null;
    iconUrl = 'image/app-service-plan.svg';
    title = 'Production';
    description = 'For most production workloads';
    isExpanded = false;

    constructor(private _injector: Injector) {
        if (this._injector) { }
    }
}

export class IsolatedSpecGroup implements PriceSpecGroup {
    specs = [
        new IsolatedSmallPlanPriceSpec(this._injector),
        new IsolatedMediumPlanPriceSpec(this._injector),
        new IsolatedLargePlanPriceSpec(this._injector)
    ];

    selectedSpec = null;
    iconUrl = 'image/app-service-environment.svg';
    title = 'Isolated';
    description = 'Advanced networking and scale';
    isExpanded = false;

    constructor(private _injector: Injector) {
        if (this._injector) { }
    }
}