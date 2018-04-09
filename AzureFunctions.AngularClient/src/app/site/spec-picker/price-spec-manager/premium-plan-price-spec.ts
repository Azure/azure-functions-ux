import { PriceSpec, PriceSpecInput } from './price-spec';
import { Kinds } from '../../../shared/models/constants';
import { Injector } from '@angular/core';

export abstract class PremiumPlanPriceSpec extends PriceSpec {

    featureItems = [{
        iconUrl: 'image/ssl.svg',
        title: 'Custom domains / SSL',
        description: 'Includes SNI and IP SSL Support'
    },
    {
        iconUrl: 'image/scale-up.svg',
        title: 'Auto scale',
        description: 'Up to 20 instances.  Subject to availability'
    },
    {
        iconUrl: 'image/slots.svg',
        title: '20 slots',
        description: 'Web app staging'
    },
    {
        iconUrl: 'image/backups.svg',
        title: 'Daily Backups',
        description: '50 times daily'
    },
    {
        iconUrl: 'image/globe.svg',
        title: 'Traffic manager',
        description: 'Geo availability'
    }];

    hardwareItems = [{
        iconUrl: 'image/app-service-plan.svg',
        title: 'CPU',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'
    },
    {
        iconUrl: 'image/website-power.svg',
        title: 'Memory',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'
    },
    {
        iconUrl: 'image/storage.svg',
        title: 'Storage',
        description: '250 GB'
    }];

    cssClass = 'spec premium-spec';

    constructor(injector: Injector) {
        super(injector);
    }

    runInitialization(input: PriceSpecInput) {
        // data should only be populated for new plans
        if (input.specPickerInput.data) {
            if (input.specPickerInput.data.hostingEnvironmentName) {
                this.state = 'hidden';
            } else if (input.specPickerInput.data.isLinux) {
                this.state = 'hidden';
            } else if (input.specPickerInput.data.isXenon) {
                this.state = 'hidden';
            }
        } else if (input.plan) {
            if (input.plan.kind && input.plan.kind.toLowerCase().indexOf(Kinds.linux) > -1) {
                this.state = 'hidden';
            } else if (input.plan.properties.hostingEnvironmentProfile) {
                this.state = 'hidden';
            }
        }

        return this.checkIfDreamspark(input.subscriptionId);
    }
}

export class PremiumSmallPlanPriceSpec extends PremiumPlanPriceSpec {
    skuCode = 'P1';
    legacySkuName = 'small_premium';
    topLevelFeatures = [
        '2x cores',
        '7.5 GB  Memory',
        '800 ACU'
    ];

    meterFriendlyName = 'Premium Small App Service Hours';

    specResourceSet = {
        id: 'p1',
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}

export class PremiumMediumPlanPriceSpec extends PremiumPlanPriceSpec {
    skuCode = 'P2';
    legacySkuName = 'medium_premium';
    topLevelFeatures = [
        '2x cores',
        '7.5 GB  Memory',
        '800 ACU'
    ];

    meterFriendlyName = 'Premium Medium App Service Hours';

    specResourceSet = {
        id: 'p2',
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}

export class PremiumLargePlanPriceSpec extends PremiumPlanPriceSpec {
    skuCode = 'P2';
    legacySkuName = 'large_premium';
    topLevelFeatures = [
        '4x cores',
        '14 GB  Memory',
        '1600 ACU'
    ];

    meterFriendlyName = 'Premium Large App Service Hours';

    specResourceSet = {
        id: 'p2',
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}