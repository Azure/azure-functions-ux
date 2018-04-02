import { BillingService } from './../../../shared/services/billing.service';
import { ServerFarm } from './../../../shared/models/server-farm';
import { SpecResourceSet } from './billing-models';
import { BillingMeter } from './../../../shared/models/arm/billingMeter';
import { Observable } from 'rxjs/Rx';
import { PriceSpecDetail } from './price-spec-detail';
import { ArmObj } from '../../../shared/models/arm/arm-obj';
import { Injector } from '@angular/core';
import { SubscriptionQuotaIds, LogCategories } from '../../../shared/models/constants';
import { LogService } from '../../../shared/services/log.service';
// import { GeoRegion } from '../../../shared/models/arm/georegion';

export interface PriceSpecInput {
    // geoRegions: ArmObj<GeoRegion>[];
    subscriptionId: string;
    billingMeters: ArmObj<BillingMeter>[];
    plan?: ArmObj<ServerFarm>;
}

export abstract class PriceSpec {
    abstract skuCode: string;                // SKU code name, like S1 or P1v2
    abstract topLevelFeatures: string[];     // Features that show up in the card, like "1x cores", "1.75GB RAM", etc...
    abstract featureItems: PriceSpecDetail[];
    abstract hardwareItems: PriceSpecDetail[];
    abstract specResourceSet: SpecResourceSet;

    cssClass = 'spec';

    allowZeroCost = false;
    state: 'enabled' | 'disabled' | 'hidden' = 'enabled';
    disabledMessage: string;
    disabledInfoLink: string;
    priceString: string;

    protected meterFriendlyName: string;
    protected _billingService: BillingService;
    protected _logService: LogService;

    constructor(injector: Injector) {
        this._billingService = injector.get(BillingService);
        this._logService = injector.get(LogService);
    }

    initialize(input: PriceSpecInput): Observable<void> {
        this._setBillingResourceId(input.billingMeters);

        this._logService.debug(LogCategories.specPicker, `Call runInitialize for ${this.skuCode}`);
        return this.runInitialization(input)
            .do(r => {
                this._logService.debug(LogCategories.specPicker, `Completed runInitialize for ${this.skuCode}`);
            });
    }

    abstract runInitialization(input: PriceSpecInput): Observable<void>;

    private _setBillingResourceId(billingMeters: ArmObj<BillingMeter>[]) {
        if (!this.meterFriendlyName) {
            throw Error('meterFriendlyName must be set');
        }

        if (!this.specResourceSet || !this.specResourceSet.firstParty || this.specResourceSet.firstParty.length !== 1) {
            throw Error('Spec must contain a specResourceSet with one firstParty item defined');
        }

        const billingMeter = billingMeters.find(m => m.properties.friendlyName === this.meterFriendlyName);

        if (!billingMeter) {
            throw Error(`billingMeter ${this.meterFriendlyName} not found!`);
        }

        this.specResourceSet.firstParty[0].resourceId = billingMeter.properties.meterId;
    }

    protected checkIfDreamspark(subscriptionId: string) {
        if (this.state !== 'hidden') {

            return this._billingService.checkIfSubscriptionHasQuotaId(subscriptionId, SubscriptionQuotaIds.dreamSparkQuotaId)
                .do(isDreamspark => {

                    if (isDreamspark) {
                        this.state = 'disabled';
                        this.disabledMessage = 'Your Subscription does not allow this pricing tier';
                        this.disabledInfoLink = `https://account.windowsazure.com/Subscriptions/Statement?subscriptionId=${subscriptionId}&isRdfeId=true&launchOption=upgrade`;
                    }
                });
        }

        return Observable.of(null);
    }
}

