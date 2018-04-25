import { PortalResources } from 'app/shared/models/portal-resources';
import { Observable } from 'rxjs/Observable';
import { Injector } from '@angular/core/src/core';
import { PriceSpec, PriceSpecInput } from './price-spec';

export abstract class StandardPlanPriceSpec extends PriceSpec {

    featureItems = [{
        iconUrl: 'image/ssl.svg',
        title: this._ts.instant(PortalResources.pricing_customDomainsSsl),
        description: this._ts.instant(PortalResources.pricing_customDomainsIpSslDesc)
    },
    {
        iconUrl: 'image/scale-up.svg',
        title: this._ts.instant(PortalResources.pricing_autoScale),
        description: this._ts.instant(PortalResources.pricing_scaleDesc).format(10)
    },
    {
        iconUrl: 'image/slots.svg',
        title: this._ts.instant(PortalResources.pricing_stagingSlots),
        description: this._ts.instant(PortalResources.pricing_slotsDesc).format(10)
    },
    {
        iconUrl: 'image/backups.svg',
        title: this._ts.instant(PortalResources.pricing_dailyBackups),
        description: this._ts.instant(PortalResources.pricing_dailyBackupDesc).format(10)
    }];

    hardwareItems = [{
        iconUrl: 'image/app-service-plan.svg',
        title: this._ts.instant(PortalResources.cpu),
        description: this._ts.instant(PortalResources.pricing_dedicatedCpu)
    },
    {
        iconUrl: 'image/website-power.svg',
        title: this._ts.instant(PortalResources.memory),
        description: this._ts.instant(PortalResources.pricing_dedicatedMemory)
    },
    {
        iconUrl: 'image/storage.svg',
        title: this._ts.instant(PortalResources.storage),
        description: this._ts.instant(PortalResources.pricing_sharedDisk).format('50 GB')
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
        this._ts.instant(PortalResources.pricing_numCores).format('1x'),
        this._ts.instant(PortalResources.pricing_memory).format('1.75'),
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
        this._ts.instant(PortalResources.pricing_numCores).format('2x'),
        this._ts.instant(PortalResources.pricing_memory).format('3.5'),
        '200 ACU'
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
        this._ts.instant(PortalResources.pricing_numCores).format('4x'),
        this._ts.instant(PortalResources.pricing_memory).format('7'),
        '400 ACU'
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
