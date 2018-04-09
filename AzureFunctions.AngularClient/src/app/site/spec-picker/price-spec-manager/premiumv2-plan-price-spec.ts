import { PortalResources } from 'app/shared/models/portal-resources';
import { PlanService } from './../../../shared/services/plan.service';
import { PriceSpec, PriceSpecInput } from './price-spec';
import { Observable } from 'rxjs/Observable';
import { Kinds } from '../../../shared/models/constants';
import { Injector } from '@angular/core';
import { ResourceId } from '../../../shared/models/arm/arm-obj';

export abstract class PremiumV2PlanPriceSpec extends PriceSpec {

    protected readonly _disabledLink = 'https://go.microsoft.com/fwlink/?linkid=856301';


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

    private _planService: PlanService;

    constructor(injector: Injector) {
        super(injector);
        this._planService = injector.get(PlanService);
    }

    runInitialization(input: PriceSpecInput) {
        let $checkStamp: Observable<any> = Observable.of(null);

        if (input.specPickerInput.data) {
            if (input.specPickerInput.data.hostingEnvironmentName) {
                this.state = 'hidden';
            } else {
                return this._planService.getAvailablePremiumV2GeoRegions(input.specPickerInput.data.subscriptionId)
                    .do(geoRegions => {
                        if (!geoRegions.find(g => g.properties.name.toLowerCase() === input.specPickerInput.data.location.toLowerCase())) {
                            this.state = 'disabled';
                            this.disabledMessage = this._ts.instant(PortalResources.pricing_pv2NotAvailable);
                            this.disabledInfoLink = this._disabledLink;
                        }
                    });
            }
        }
        if (input.specPickerInput.data && input.specPickerInput.data.hostingEnvironmentName) {
            this.state = 'hidden';
        } else if (input.plan) {
            if (input.plan.kind && input.plan.kind.toLowerCase().indexOf(Kinds.linux) > -1) {
                this.state = 'hidden';
            } else if (input.plan.properties.hostingEnvironmentProfile) {
                this.state = 'hidden';
            } else {

                $checkStamp = this._checkIfPremiumV2EnabledOnStamp(input.plan.id);
            }

            return $checkStamp.switchMap(_ => {
                return this.checkIfDreamspark(input.subscriptionId);
            });
        }

        return Observable.of(null);
    }

    private _checkIfPremiumV2EnabledOnStamp(resourceId: ResourceId) {
        if (this.state !== 'hidden') {
            return this._planService.getAvailableSkusForPlan(resourceId)
                .do(availableSkus => {
                    this.state = availableSkus.find(s => s.sku.name.indexOf('v2') > -1) ? 'enabled' : 'disabled';

                    if (this.state === 'disabled') {
                        this.disabledMessage = this._ts.instant(PortalResources.pricing_pv2NotAvailable);
                        this.disabledInfoLink = this._disabledLink;
                    }
                });
        }

        return Observable.of(null);
    }
}

export class PremiumV2SmallPlanPriceSpec extends PremiumV2PlanPriceSpec {
    skuCode = 'P1v2';
    legacySkuName = 'D1_premiumV2';
    topLevelFeatures = [
        '1x cores',
        '3.5 GB  Memory',
        '400 ACU'
    ];

    meterFriendlyName = 'Premium V2 Small App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}

export class PremiumV2MediumPlanPriceSpec extends PremiumV2PlanPriceSpec {
    skuCode = 'P2v2';
    legacySkuName = 'D2_premiumV2';
    topLevelFeatures = [
        '2x cores',
        '7 GB  Memory',
        '800 ACU'
    ];

    meterFriendlyName = 'Premium V2 Medium App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}

export class PremiumV2LargePlanPriceSpec extends PremiumV2PlanPriceSpec {
    skuCode = 'P3v2';
    legacySkuName = 'D3_premiumV2';
    topLevelFeatures = [
        '4x cores',
        '14 GB  Memory',
        '1600 ACU'
    ];

    meterFriendlyName = 'Premium V2 Large App Service Hours';

    specResourceSet = {
        id: this.skuCode,
        firstParty: [{
            quantity: 744,
            resourceId: null
        }]
    };
}