import { SpecPickerComponent } from './../spec-picker.component';
import { SpecCostQueryResult, SpecResourceSet } from './../price-spec-manager/billing-models';
import { PriceSpecGroup, DevSpecGroup, ProdSpecGroup, IsolatedSpecGroup } from './price-spec-group';
import { PortalService } from './../../../shared/services/portal.service';
import { PlanService } from './../../../shared/services/plan.service';
import { Injector } from '@angular/core';
import { ArmResourceDescriptor } from '../../../shared/resourceDescriptors';
import { Observable } from 'rxjs/Observable';
import { ResourceId, ArmObj } from '../../../shared/models/arm/arm-obj';
import { ServerFarm } from '../../../shared/models/server-farm';
// import { GeoRegion } from '../../../shared/models/arm/georegion';
import { SpecCostQueryInput } from './billing-models';

export class PlanPriceSpecManager {

    selectedSpecGroup: PriceSpecGroup;
    specGroups: PriceSpecGroup[] = [
        new DevSpecGroup(this._injector),
        new ProdSpecGroup(this._injector),
        new IsolatedSpecGroup(this._injector)];

    get currentSkuCode(): string {
        if (!this._plan) {
            return null;
        }

        return this._plan.sku.name;
    }

    private _planService: PlanService;
    private _portalService: PortalService;
    private _descriptor: ArmResourceDescriptor;
    private _plan: ArmObj<ServerFarm>;

    constructor(private _specPicker: SpecPickerComponent, private _injector: Injector) {
        this._planService = _injector.get(PlanService);
        this._portalService = _injector.get(PortalService);
    }

    initialize(resourceId: ResourceId) {

        this._descriptor = new ArmResourceDescriptor(resourceId);
        this.selectedSpecGroup = this.specGroups[0];

        return this._planService.getPlan(resourceId, true)
            .switchMap(r => {

                if (r.isSuccessful) {
                    this._plan = r.result;

                    if (this._plan.sku.name === 'Y1') {
                        this._specPicker.infoMessage = {
                            message: 'Scale up is not available for consumption plans',
                            level: 'error'
                        };

                        this._specPicker.shieldEnabled = true;
                    }
                } else {
                    this._specPicker.infoMessage = {
                        message: 'You must have write permissions to scale up this plan',
                        level: 'error'
                    };

                    this._specPicker.shieldEnabled = true;

                    return Observable.of(null);
                }

                return this._planService.getBillingMeters(this._descriptor.subscription, this._plan.location);
            })
            .switchMap(r => {
                if (!r) {
                    return Observable.of(null);
                }

                const billingMeters = r;
                let specInitCalls: Observable<void>[] = [];

                // Initialize every spec for each spec group.  For most cards this is a no-op, but
                // some require special handling so that we know if we need to hide/disable a card.
                this.specGroups.forEach(g => {
                    specInitCalls = specInitCalls.concat(g.specs.map(s => s.initialize({
                        billingMeters: billingMeters,
                        plan: this._plan,
                        subscriptionId: this._descriptor.subscription
                    })));
                });

                return Observable.zip(...specInitCalls);
            })
            .do(_ => {
                this._cleanUpSpecGroups();
            });
    }

    getSpecCosts() {
        let specResourceSets: SpecResourceSet[] = [];
        let specsToAllowZeroCost: string[] = [];

        this.specGroups.forEach(g => {
            specResourceSets = specResourceSets.concat(g.specs.map(s => s.specResourceSet));
            specsToAllowZeroCost = specsToAllowZeroCost.concat(g.specs.filter(s => s.allowZeroCost).map(s => s.specResourceSet.id));
        });

        const query: SpecCostQueryInput = {
            subscriptionId: this._descriptor.subscription,
            specResourceSets: specResourceSets,
            specsToAllowZeroCost: specsToAllowZeroCost,
            specType: 'WebsitesExtension',
        };

        return this._portalService.getSpecCosts(query)
            .do(result => {
                if (!result.isSuccess) {
                    // todo: error handling
                    return;
                }

                this.specGroups.forEach(g => this._updatePriceStrings(result, g));
            });
    }

    applySelectedSpec() {
        const plan: ArmObj<ServerFarm> = JSON.parse(JSON.stringify(this._plan));
        plan.sku = {
            name: this.selectedSpecGroup.selectedSpec.skuCode
        };

        return this._planService.updatePlan(plan)
            .do(r => {
                if (r.isSuccessful) {
                    this._plan = r.result.json();
                }
            });
    }

    private _updatePriceStrings(result: SpecCostQueryResult, specGroup: PriceSpecGroup) {
        specGroup.specs.forEach(spec => {
            const costResult = result.costs.find(c => c.id === spec.specResourceSet.id);
            if (costResult.amount === 0.0) {
                spec.priceString = 'Free';
            } else {
                const meter = costResult.firstParty[0].meters[0];
                spec.priceString = `${meter.perUnitAmount} ${meter.perUnitCurrencyCode}/Hour (Estimated)`;
            }
        });
    }

    private _cleanUpSpecGroups() {
        let nonEmptyGroupIndex = 0;
        let foundNonEmptyGroup = false;

        // Remove hidden specs and move disabled specs to end of list.
        this.specGroups.forEach((g, i) => {

            const enabledSpecs = g.specs.filter(s => s.state !== 'disabled' && s.state !== 'hidden');
            const disabledSpecs = g.specs.filter(s => s.state === 'disabled');

            g.specs = enabledSpecs.concat(disabledSpecs);

            // Initialize the currently selected spec for each group
            g.selectedSpec = g.specs.find((s, specIndex) => {

                // If the current SKU is below the fold, then automatically expand the group.
                if (s.skuCode.toLowerCase() === this._plan.sku.name.toLowerCase()) {
                    g.isExpanded = specIndex > 3;
                    return true;
                }

                return false;
            });


            if (!foundNonEmptyGroup && g.specs.length === 0) {
                nonEmptyGroupIndex++;
            } else {
                foundNonEmptyGroup = true;
            }
        });

        if (nonEmptyGroupIndex < this.specGroups.length) {
            // The UI loads the default set of cards immediately, but the specManager filters them out
            // based on each cards initialization logic.  Angular isn't able to detect the updated filtered
            // view in the list, so we're forcing an update by creating a new reference
            this.specGroups[nonEmptyGroupIndex] = Object.assign({}, this.specGroups[nonEmptyGroupIndex]);
            this.selectedSpecGroup = this.specGroups[nonEmptyGroupIndex];
        }
    }
}
