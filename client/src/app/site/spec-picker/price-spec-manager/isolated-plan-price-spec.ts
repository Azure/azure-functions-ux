import { Kinds } from './../../../shared/models/constants';
import { NationalCloudEnvironment } from './../../../shared/services/scenario/national-cloud.environment';
import { PriceSpec, PriceSpecInput } from './price-spec';
import { Injector } from '@angular/core';
import { AseService } from '../../../shared/services/ase.service';

export abstract class IsolatedPlanPriceSpec extends PriceSpec {

    featureItems = [{
        iconUrl: 'image/app-service-environment.svg',
        title: 'Single tenant system',
        description: 'App Service Environment'
    },
    {
        iconUrl: 'image/networking.svg',
        title: 'Isolated network',
        description: 'Runs within your virtual network'
    },
    {
        iconUrl: 'image/active-directory.svg',
        title: 'Private app access',
        description: 'Using an ILB ASE'
    },
    {
        iconUrl: 'image/scale-up.svg',
        title: 'Scale up to 100 instances',
        description: 'More allowed upon request'
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
        description: '1 TB'
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

            if (input.plan.kind && input.plan.kind.toLowerCase().indexOf(Kinds.linux) > -1) {
                this.state = 'hidden';
            } else if (!input.plan.properties.hostingEnvironmentProfile) {
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
        '1x cores',
        '3.5 GB  Memory',
        '400 ACU'
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
        '2x cores',
        '7 GB  Memory',
        '800 ACU'
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
        '4x cores',
        '14 GB  Memory',
        '1600 ACU'
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