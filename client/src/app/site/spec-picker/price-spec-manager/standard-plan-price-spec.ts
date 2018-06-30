import { Links } from './../../../shared/models/constants';
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
        description: this._ts.instant(PortalResources.pricing_slotsDesc).format(5)
    },
    {
        iconUrl: 'image/backups.svg',
        title: this._ts.instant(PortalResources.pricing_dailyBackups),
        description: this._ts.instant(PortalResources.pricing_dailyBackupDesc).format(10)
    },
    {
        iconUrl: 'image/globe.svg',
        title: this._ts.instant(PortalResources.pricing_trafficManager),
        description: this._ts.instant(PortalResources.pricing_trafficManagerDesc)
    }];

    hardwareItems = [{
        iconUrl: 'image/app-service-plan.svg',
        title: this._ts.instant(PortalResources.cpu),
        description: this._ts.instant(PortalResources.pricing_aSeriesDedicatedCpu),
        learnMoreUrl: Links.vmSizeLearnMore
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
        this._ts.instant(PortalResources.pricing_aSeriesCompute)
    ];

    meterFriendlyName = 'Standard Small App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };

    runInitialization(input: PriceSpecInput) {
        if ((input.specPickerInput.data && input.specPickerInput.data.isXenon)
            || (input.plan && input.plan.properties.isXenon)) {
            const slotsFeatureIndex = this.featureItems.findIndex(f => f.title === this._ts.instant(PortalResources.pricing_stagingSlots));
            if (slotsFeatureIndex > -1) {
                this.featureItems.splice(slotsFeatureIndex, 1);
            }
        }

        return super.runInitialization(input);
    }
}

export class StandardMediumPlanPriceSpec extends StandardPlanPriceSpec {
    skuCode = 'S2';
    legacySkuName = 'medium_standard';
    topLevelFeatures = [
        this._ts.instant(PortalResources.pricing_numCores).format('2x'),
        this._ts.instant(PortalResources.pricing_memory).format('3.5'),
        this._ts.instant(PortalResources.pricing_aSeriesCompute)
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

        if (input.plan && input.plan.properties.isXenon) {
            this.state = 'hidden';
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
        this._ts.instant(PortalResources.pricing_aSeriesCompute)
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

        if (input.plan && input.plan.properties.isXenon) {
            this.state = 'hidden';
        }

        return super.runInitialization(input);
    }
}
