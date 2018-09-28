import { Links } from './../../../shared/models/constants';
import { PortalResources } from 'app/shared/models/portal-resources';
import { PriceSpec, PriceSpecInput } from './price-spec';

export abstract class BasicPlanPriceSpec extends PriceSpec {

    featureItems = [{
        iconUrl: 'image/ssl.svg',
        title: this._ts.instant(PortalResources.pricing_customDomainsSsl),
        description: this._ts.instant(PortalResources.pricing_customDomainsSslDesc)
    },
    {
        iconUrl: 'image/scale-up.svg',
        title: this._ts.instant(PortalResources.pricing_manualScale),
        description: this._ts.instant(PortalResources.pricing_scaleDesc).format(3)
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
        description: this._ts.instant(PortalResources.pricing_sharedDisk).format('10 GB')
    }];

    cssClass = 'spec basic-spec';

    runInitialization(input: PriceSpecInput) {
        // data should only be populated for new plans
        if (input.specPickerInput.data) {
            if (input.specPickerInput.data.hostingEnvironmentName
                || input.specPickerInput.data.isXenon) {
                this.state = 'hidden';
            }
        } else if (input.plan) {
            if (input.plan.properties.hostingEnvironmentProfile || input.plan.properties.isXenon) {
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
        this._ts.instant(PortalResources.pricing_numCores).format('1x'),
        this._ts.instant(PortalResources.pricing_ACU).format('100'),
        this._ts.instant(PortalResources.pricing_memory).format('1.75'),
        this._ts.instant(PortalResources.pricing_aSeriesCompute)
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
        this._ts.instant(PortalResources.pricing_numCores).format('2x'),
        this._ts.instant(PortalResources.pricing_ACU).format('200'),
        this._ts.instant(PortalResources.pricing_memory).format('3.5'),
        this._ts.instant(PortalResources.pricing_aSeriesCompute)
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
        this._ts.instant(PortalResources.pricing_numCores).format('4x'),
        this._ts.instant(PortalResources.pricing_ACU).format('400'),
        this._ts.instant(PortalResources.pricing_memory).format('7'),
        this._ts.instant(PortalResources.pricing_aSeriesCompute)
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