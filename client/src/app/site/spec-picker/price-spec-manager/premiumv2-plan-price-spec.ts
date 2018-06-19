import { Links } from './../../../shared/models/constants';
import { PortalResources } from 'app/shared/models/portal-resources';
import { PlanService } from './../../../shared/services/plan.service';
import { PriceSpec, PriceSpecInput } from './price-spec';
import { Observable } from 'rxjs/Observable';
import { Injector } from '@angular/core';
import { ResourceId } from '../../../shared/models/arm/arm-obj';

export abstract class PremiumV2PlanPriceSpec extends PriceSpec {

    protected readonly _disabledLink = 'https://go.microsoft.com/fwlink/?linkid=856301';

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
                return this.checkIfDreamspark(input.subscriptionId)
                    .switchMap(isDreamspark => {
                        if (!isDreamspark) {
                            return this._planService.getAvailablePremiumV2GeoRegions(
                                input.specPickerInput.data.subscriptionId, input.specPickerInput.data.isLinux)
                                .do(geoRegions => {
                                    if (!geoRegions.find(g => g.properties.name.toLowerCase() === input.specPickerInput.data.location.toLowerCase())) {
                                        this.state = 'disabled';
                                        this.disabledMessage = this._ts.instant(PortalResources.pricing_pv2NotAvailable);
                                        this.disabledInfoLink = this._disabledLink;
                                    }
                                });
                        }

                        return Observable.of(null);
                    });

            }
        } else if (input.plan) {
            if (input.plan.properties.hostingEnvironmentProfile) {
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
        this._ts.instant(PortalResources.pricing_numCores).format('1x'),
        this._ts.instant(PortalResources.pricing_memory).format('3.5'),
        this._ts.instant(PortalResources.pricing_dSeriesCompute)
    ];

    meterFriendlyName = 'Premium V2 Small App Service Hours';

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

export class PremiumV2MediumPlanPriceSpec extends PremiumV2PlanPriceSpec {
    skuCode = 'P2v2';
    legacySkuName = 'D2_premiumV2';
    topLevelFeatures = [
        this._ts.instant(PortalResources.pricing_numCores).format('2x'),
        this._ts.instant(PortalResources.pricing_memory).format('7'),
        this._ts.instant(PortalResources.pricing_dSeriesCompute)
    ];

    meterFriendlyName = 'Premium V2 Medium App Service Hours';

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

export class PremiumV2LargePlanPriceSpec extends PremiumV2PlanPriceSpec {
    skuCode = 'P3v2';
    legacySkuName = 'D3_premiumV2';
    topLevelFeatures = [
        this._ts.instant(PortalResources.pricing_numCores).format('4x'),
        this._ts.instant(PortalResources.pricing_memory).format('14'),
        this._ts.instant(PortalResources.pricing_dSeriesCompute)
    ];

    meterFriendlyName = 'Premium V2 Large App Service Hours';

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