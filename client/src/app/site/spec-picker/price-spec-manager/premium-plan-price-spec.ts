import { Links } from 'app/shared/models/constants';
import { PriceSpec, PriceSpecInput } from './price-spec';
import { Kinds } from '../../../shared/models/constants';
import { Injector } from '@angular/core';
import { PortalResources } from '../../../shared/models/portal-resources';

export abstract class PremiumPlanPriceSpec extends PriceSpec {

    featureItems = [{
        iconUrl: 'image/ssl.svg',
        title: this._ts.instant(PortalResources.pricing_customDomainsSsl),
        description: this._ts.instant(PortalResources.pricing_customDomainsIpSslDesc)
    },
    {
        iconUrl: 'image/scale-up.svg',
        title: this._ts.instant(PortalResources.pricing_autoScale),
        description: this._ts.instant(PortalResources.pricing_scaleDesc).format(20)
    },
    {
        iconUrl: 'image/slots.svg',
        title: this._ts.instant(PortalResources.pricing_stagingSlots),
        description: this._ts.instant(PortalResources.pricing_slotsDesc).format(20)
    },
    {
        iconUrl: 'image/backups.svg',
        title: this._ts.instant(PortalResources.pricing_dailyBackups),
        description: this._ts.instant(PortalResources.pricing_dailyBackupDesc).format(50)
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
        description: this._ts.instant(PortalResources.pricing_sharedDisk).format('250 GB')
    }];

    cssClass = 'spec premium-spec';

    constructor(injector: Injector) {
        super(injector);
    }

    runInitialization(input: PriceSpecInput) {
        // data should only be populated for new plans
        if (input.specPickerInput.data) {
            if (input.specPickerInput.data.hostingEnvironmentName
                || input.specPickerInput.data.isLinux
                || input.specPickerInput.data.isXenon) {
                this.state = 'hidden';
            }
        } else if (input.plan) {
            if (input.plan.kind && input.plan.kind.toLowerCase().indexOf(Kinds.linux) > -1) {
                this.state = 'hidden';
            } else if (input.plan.properties.hostingEnvironmentProfile || input.plan.properties.isXenon) {
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
        this._ts.instant(PortalResources.pricing_numCores).format('1x'),
        this._ts.instant(PortalResources.pricing_memory).format('1.75'),
        this._ts.instant(PortalResources.pricing_aSeriesCompute)
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
        this._ts.instant(PortalResources.pricing_numCores).format('2x'),
        this._ts.instant(PortalResources.pricing_memory).format('3.5'),
        this._ts.instant(PortalResources.pricing_aSeriesCompute)
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
    skuCode = 'P3';
    legacySkuName = 'large_premium';
    topLevelFeatures = [
        this._ts.instant(PortalResources.pricing_numCores).format('4x'),
        this._ts.instant(PortalResources.pricing_memory).format('7'),
        this._ts.instant(PortalResources.pricing_aSeriesCompute)
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