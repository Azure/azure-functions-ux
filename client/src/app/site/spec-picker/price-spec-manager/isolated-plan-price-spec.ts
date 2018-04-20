import { Kinds } from './../../../shared/models/constants';
import { NationalCloudEnvironment } from './../../../shared/services/scenario/national-cloud.environment';
import { PriceSpec, PriceSpecInput } from './price-spec';
import { Injector } from '@angular/core';
import { AseService } from '../../../shared/services/ase.service';
import { PortalResources } from '../../../shared/models/portal-resources';

export abstract class IsolatedPlanPriceSpec extends PriceSpec {

    featureItems = [{
        iconUrl: 'image/app-service-environment.svg',
        title: this._ts.instant(PortalResources.pricing_ase),
        description: this._ts.instant(PortalResources.pricing_aseDesc)
    },
    {
        iconUrl: 'image/networking.svg',
        title: this._ts.instant(PortalResources.pricing_isolatedNetwork),
        description: this._ts.instant(PortalResources.pricing_isolatedNetworkDesc)
    },
    {
        iconUrl: 'image/active-directory.svg',
        title: this._ts.instant(PortalResources.pricing_privateAppAccess),
        description: this._ts.instant(PortalResources.pricing_privateAppAccessDesc)
    },
    {
        iconUrl: 'image/scale-up.svg',
        title: this._ts.instant(PortalResources.pricing_largeScale),
        description: this._ts.instant(PortalResources.pricing_largeScaleDesc)
    }];

    hardwareItems = [{
        iconUrl: 'image/app-service-plan.svg',
        title: this._ts.instant(PortalResources.cpu),
        description: this._ts.instant(PortalResources.pricing_dedicatedCpu),
        learnMoreUrl: 'https://docs.microsoft.com/en-us/azure/virtual-machines/windows/acu'
    },
    {
        iconUrl: 'image/website-power.svg',
        title: this._ts.instant(PortalResources.memory),
        description: this._ts.instant(PortalResources.pricing_dedicatedMemory)
    },
    {
        iconUrl: 'image/storage.svg',
        title: this._ts.instant(PortalResources.storage),
        description: this._ts.instant(PortalResources.pricing_sharedDisk).format('1 TB')
    }];

    cssClass = 'spec isolated-spec';

    private _aseService: AseService;

    constructor(injector: Injector) {
        super(injector);

        this._aseService = injector.get(AseService);
    }

    runInitialization(input: PriceSpecInput) {

        if (NationalCloudEnvironment.isBlackforest() || NationalCloudEnvironment.isMooncake()) {
            this.state = 'hidden';
        } else if (input.specPickerInput.data && !input.specPickerInput.data.allowAseV2Creation) {
            this.state = 'hidden';
        } else if (input.plan) {

            if (!input.plan.properties.hostingEnvironmentProfile) {
                this.state = 'hidden';
            } else {
                return this._aseService.getAse(input.plan.properties.hostingEnvironmentProfile.id)
                    .do(r => {
                        // If the call to get the ASE fails (maybe due to RBAC), then we can't confirm ASE v1 or v2
                        // but we'll let them see the isolated card anyway.  The plan update will probably fail in
                        // the back-end if it's ASE v1, but at least we allow real ASE v2 customers who don't have
                        // ASE permissions to scale their plan.
                        if (r.isSuccessful
                            && r.result.kind
                            && r.result.kind.toLowerCase().indexOf(Kinds.aseV2.toLowerCase()) === -1) {

                            this.state = 'hidden';
                        }
                    });
            }
        }

        return this.checkIfDreamspark(input.subscriptionId);
    }
}

export class IsolatedSmallPlanPriceSpec extends IsolatedPlanPriceSpec {
    skuCode = 'I1';
    legacySkuName = 'small_isolated';
    topLevelFeatures = [
        this._ts.instant(PortalResources.pricing_numCores).format('1x'),
        this._ts.instant(PortalResources.pricing_memory).format('3.5'),
        '210 ACU'
    ];

    meterFriendlyName = 'Isolated Small App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}

export class IsolatedMediumPlanPriceSpec extends IsolatedPlanPriceSpec {
    skuCode = 'I2';
    legacySkuName = 'medium_isolated';
    topLevelFeatures = [
        this._ts.instant(PortalResources.pricing_numCores).format('2x'),
        this._ts.instant(PortalResources.pricing_memory).format('7'),
        '420 ACU'
    ];

    meterFriendlyName = 'Isolated Medium App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}

export class IsolatedLargePlanPriceSpec extends IsolatedPlanPriceSpec {
    skuCode = 'I3';
    legacySkuName = 'large_isolated';
    topLevelFeatures = [
        this._ts.instant(PortalResources.pricing_numCores).format('4x'),
        this._ts.instant(PortalResources.pricing_memory).format('14'),
        '840 ACU'
    ];

    meterFriendlyName = 'Isolated Large App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}