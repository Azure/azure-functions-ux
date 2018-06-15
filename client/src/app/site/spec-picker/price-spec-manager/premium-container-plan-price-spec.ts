import { PriceSpec, PriceSpecInput } from './price-spec';
import { Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PortalResources } from '../../../shared/models/portal-resources';
import { Links } from '../../../shared/models/constants';

export abstract class PremiumContainerPlanPriceSpec extends PriceSpec {

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
    },
    {
        iconUrl: 'image/globe.svg',
        title: this._ts.instant(PortalResources.pricing_trafficManager),
        description: this._ts.instant(PortalResources.pricing_trafficManagerDesc)
    }];

    hardwareItems = [{
        iconUrl: 'image/app-service-plan.svg',
        title: this._ts.instant(PortalResources.cpu),
        description: this._ts.instant(PortalResources.pricing_dv2SeriesDedicatedCpu),
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
        return Observable.of(null);
    }
}

export class PremiumContainerSmallPriceSpec extends PremiumContainerPlanPriceSpec {
    skuCode = 'PC2';
    legacySkuName = '';
    topLevelFeatures = [
        this._ts.instant(PortalResources.pricing_numCores).format('1x'),
        this._ts.instant(PortalResources.pricing_memory).format('3.5'),
        this._ts.instant(PortalResources.pricing_dSeriesCompute)
    ];

    meterFriendlyName = 'Premium Container Small App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}

export class PremiumContainerMediumPriceSpec extends PremiumContainerPlanPriceSpec {
    skuCode = 'PC3';
    legacySkuName = '';
    topLevelFeatures = [
        this._ts.instant(PortalResources.pricing_numCores).format('1x'),
        this._ts.instant(PortalResources.pricing_memory).format('3.5'),
        this._ts.instant(PortalResources.pricing_dSeriesCompute)
    ];

    meterFriendlyName = 'Premium Container Medium App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}

export class PremiumContainerLargePriceSpec extends PremiumContainerPlanPriceSpec {
    skuCode = 'PC4';
    legacySkuName = '';
    topLevelFeatures = [
        this._ts.instant(PortalResources.pricing_numCores).format('1x'),
        this._ts.instant(PortalResources.pricing_memory).format('3.5'),
        this._ts.instant(PortalResources.pricing_dSeriesCompute)
    ];

    meterFriendlyName = 'Premium Container Large App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}
