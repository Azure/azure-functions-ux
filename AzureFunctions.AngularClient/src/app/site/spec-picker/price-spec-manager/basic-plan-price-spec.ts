import { PriceSpec, PriceSpecInput } from './price-spec';

export abstract class BasicPlanPriceSpec extends PriceSpec {

    featureItems = [{
        iconUrl: 'image/ssl.svg',
        title: 'Custom domains / SSL',
        description: 'SNI SSL Included'
    },
    {
        iconUrl: 'image/scale-up.svg',
        title: 'Manual scale',
        description: 'Up to 3 instances.  Subject to availability'
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
        description: '10 GB'
    }];

    cssClass = 'spec basic-spec';

    runInitialization(input: PriceSpecInput) {
        // data should only be populated for new plans
        if (input.specPickerInput.data) {
            if (input.specPickerInput.data.hostingEnvironmentName) {
                this.state = 'hidden';
            } else if (input.specPickerInput.data.isXenon) {
                this.state = 'hidden';
            }
        } else if (input.plan) {
            if (input.plan.properties.hostingEnvironmentProfile) {
                this.state = 'hidden';
            }
        }

        return this.checkIfDreamspark(input.subscriptionId);
    }
}

export class BasicSmallPlanPriceSpec extends BasicPlanPriceSpec {
    skuCode = 'B1';
    legacySkuName = 'small_basic';
    topLevelFeatures = [
        '1x cores',
        '1.75 GB Memory',
        '100 ACU'
    ];

    meterFriendlyName = 'Basic Small App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}

export class BasicMediumPlanPriceSpec extends BasicPlanPriceSpec {
    skuCode = 'B2';
    legacySkuName = 'medium_basic';
    topLevelFeatures = [
        '2x cores',
        '3.5 GB Memory',
        '200 ACU ???'
    ];

    meterFriendlyName = 'Basic Medium App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}

export class BasicLargePlanPriceSpec extends BasicPlanPriceSpec {
    skuCode = 'B3';
    legacySkuName = 'large_basic';
    topLevelFeatures = [
        '4x cores',
        '7 GB Memory',
        '400 ACU ???'
    ];

    meterFriendlyName = 'Basic Large App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}