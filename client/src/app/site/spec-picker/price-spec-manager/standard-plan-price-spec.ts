import { Observable } from 'rxjs/Observable';
import { Injector } from '@angular/core/src/core';
import { PriceSpec, PriceSpecInput } from './price-spec';

export abstract class StandardPlanPriceSpec extends PriceSpec {

    featureItems = [{
        iconUrl: 'image/ssl.svg',
        title: 'Custom domains / SSL',
        description: 'Includes SNI and IP SSL Support'
    },
    {
        iconUrl: 'image/scale-up.svg',
        title: 'Auto scale',
        description: 'Up to 10 instances.  Subject to availability'
    },
    {
        iconUrl: 'image/slots.svg',
        title: '50 slots',
        description: 'Web app staging'
    },
    {
        iconUrl: 'image/backups.svg',
        title: 'Daily Backup',
        description: '1 daily'
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
        description: '50 GB'
    }];


    cssClass = 'spec standard-spec';

    constructor(injector: Injector) {
        super(injector);
    }

    runInitialization(input: PriceSpecInput) {
        if (input.specPickerInput.data && input.specPickerInput.data.hostingEnvironmentName) {
            this.state = 'hidden';
        } else if (input.plan) {
            if (input.plan.properties.hostingEnvironmentProfile) {
                this.state = 'hidden';
            }
        }

        return this.checkIfDreamspark(input.subscriptionId);
    }
}

export class StandardSmallPlanPriceSpec extends StandardPlanPriceSpec {
    skuCode = 'S1';
    legacySkuName = 'small_standard';
    topLevelFeatures = [
        '1x cores',
        '1.75 GB Memory',
        '100 ACU'
    ];

    meterFriendlyName = 'Standard Small App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}

export class StandardMediumPlanPriceSpec extends StandardPlanPriceSpec {
    skuCode = 'S2';
    legacySkuName = 'medium_standard';
    topLevelFeatures = [
        '2x cores',
        '3.5 GB Memory',
        '200 ACU ???'
    ];

    meterFriendlyName = 'Standard Medium App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };

    runInitialization(input: PriceSpecInput) {
        if (input.specPickerInput.data && input.specPickerInput.data.isXenon) {
            this.state = 'hidden';
            return Observable.of(null);
        }

        return super.runInitialization(input);
    }
}

export class StandardLargePlanPriceSpec extends StandardPlanPriceSpec {
    skuCode = 'S3';
    legacySkuName = 'large_standard';
    topLevelFeatures = [
        '4x cores',
        '7 GB Memory',
        '400 ACU ???'
    ];

    meterFriendlyName = 'Standard Large App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };

    runInitialization(input: PriceSpecInput) {
        if (input.specPickerInput.data && input.specPickerInput.data.isXenon) {
            this.state = 'hidden';
            return Observable.of(null);
        }

        return super.runInitialization(input);
    }
}
