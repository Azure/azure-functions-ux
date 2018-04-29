import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { SpecPickerComponent, StatusMessage } from './../spec-picker.component';
import { SpecCostQueryResult, SpecResourceSet } from './../price-spec-manager/billing-models';
import { PriceSpecGroup, DevSpecGroup, ProdSpecGroup, IsolatedSpecGroup } from './price-spec-group';
import { PortalService } from './../../../shared/services/portal.service';
import { PlanService } from './../../../shared/services/plan.service';
import { Injector } from '@angular/core';
import { ArmSubcriptionDescriptor, ArmResourceDescriptor } from '../../../shared/resourceDescriptors';
import { Observable } from 'rxjs/Observable';
import { ResourceId, ArmObj } from '../../../shared/models/arm/arm-obj';
import { ServerFarm } from '../../../shared/models/server-farm';
import { SpecCostQueryInput } from './billing-models';
import { PriceSpecInput, PriceSpec } from './price-spec';
import { Subject } from 'rxjs/Subject';

export interface SpecPickerInput<T> {
    id: ResourceId;
    data?: T;
}

export interface NewPlanSpecPickerData {
    subscriptionId: string;
    location: string;
    hostingEnvironmentName: string | null;
    allowAseV2Creation: boolean;
    forbiddenSkus: string[];
    isLinux: boolean;
    isXenon: boolean;
    selectedLegacySkuName: string;  // Looks like "small_standard"
}

export type ApplyButtonState = 'enabled' | 'disabled';

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
    private _ts: TranslateService;
    private _plan: ArmObj<ServerFarm>;
    private _subscriptionId: string;
    private _inputs: SpecPickerInput<NewPlanSpecPickerData>;
    private _ngUnsubscribe$ = new Subject();

    constructor(private _specPicker: SpecPickerComponent, private _injector: Injector) {
        this._planService = _injector.get(PlanService);
        this._portalService = _injector.get(PortalService);
        this._ts = _injector.get(TranslateService);
    }

    initialize(inputs: SpecPickerInput<NewPlanSpecPickerData>) {
        this._inputs = inputs;
        this._subscriptionId = new ArmSubcriptionDescriptor(inputs.id).subscriptionId;
        this.selectedSpecGroup = this.specGroups[0];

        return this._getBillingMeters(inputs)
            .switchMap(r => {
                if (!r) {
                    return Observable.of(null);
                }

                const billingMeters = r;
                let specInitCalls: Observable<void>[] = [];

                // Initialize every spec for each spec group.  For most cards this is a no-op, but
                // some require special handling so that we know if we need to hide/disable a card.
                this.specGroups.forEach(g => {
                    const input: PriceSpecInput = {
                        specPickerInput: inputs,
                        billingMeters: billingMeters,
                        plan: this._plan,
                        subscriptionId: this._subscriptionId
                    };

                    g.initialize(input);
                    specInitCalls = specInitCalls.concat(g.recommendedSpecs.map(s => s.initialize(input)));
                    specInitCalls = specInitCalls.concat(g.additionalSpecs.map(s => s.initialize(input)));
                });

                return Observable.zip(...specInitCalls);
            })
            .do(_ => {
                this._cleanUpGroups();
            });
    }

    getSpecCosts() {
        let specResourceSets: SpecResourceSet[] = [];
        let specsToAllowZeroCost: string[] = [];

        this.specGroups.forEach(g => {
            specResourceSets = specResourceSets.concat(g.recommendedSpecs.map(s => s.specResourceSet));
            specResourceSets = specResourceSets.concat(g.additionalSpecs.map(s => s.specResourceSet));
            specsToAllowZeroCost = specsToAllowZeroCost.concat(g.recommendedSpecs.filter(s => s.allowZeroCost).map(s => s.specResourceSet.id));
            specsToAllowZeroCost = specsToAllowZeroCost.concat(g.additionalSpecs.filter(s => s.allowZeroCost).map(s => s.specResourceSet.id));
        });

        const query: SpecCostQueryInput = {
            subscriptionId: this._subscriptionId,
            specResourceSets: specResourceSets,
            specsToAllowZeroCost: specsToAllowZeroCost,
            specType: 'WebsitesExtension',
        };

        return this._portalService.getSpecCosts(query)
            .do(result => {
                this.specGroups.forEach(g => {
                    this._updatePriceStrings(result, g.recommendedSpecs);
                    this._updatePriceStrings(result, g.additionalSpecs);
                });
            });
    }

    applySelectedSpec(): Observable<ApplyButtonState> {
        const planToUpdate: ArmObj<ServerFarm> = JSON.parse(JSON.stringify(this._plan));
        planToUpdate.sku = {
            name: this.selectedSpecGroup.selectedSpec.skuCode
        };

        let notificationId: string = null;
        const planDescriptor = new ArmResourceDescriptor(planToUpdate.id);
        return this._portalService.startNotification(
            this._ts.instant(PortalResources.pricing_planUpdateTitle),
            this._ts.instant(PortalResources.pricing_planUpdateDesc).format(planDescriptor.resourceName))
            .first()
            .switchMap(notification => {

                notificationId = notification.id;
                return this._planService.updatePlan(planToUpdate);
            })
            .map(r => {

                if (r.isSuccessful) {

                    this._plan = r.result.json();
                    this._cleanUpGroups();

                    if (this._plan.properties.hostingEnvironmentProfile && this._plan.properties.provisioningState === 'InProgress') {
                        this._portalService.stopNotification(
                            notificationId,
                            r.isSuccessful,
                            this._ts.instant(PortalResources.pricing_planUpdateJobSuccessFormat).format(planDescriptor.resourceName)
                        );

                        this._pollForIsolatedScaleCompletion(this._plan.id);
                        return <ApplyButtonState>'disabled';
                    } else {
                        this._portalService.stopNotification(
                            notificationId,
                            r.isSuccessful,
                            this._ts.instant(PortalResources.pricing_planUpdateSuccessFormat).format(planDescriptor.resourceName)
                        );
                    }
                } else {
                    this._portalService.stopNotification(
                        notificationId,
                        r.isSuccessful,
                        r.error.message ? r.error.message : this._ts.instant(PortalResources.pricing_planUpdateFailFormat).format(planDescriptor.resourceName)
                    );
                }

                return <ApplyButtonState>'enabled';
            });
    }

    dispose() {
        this._ngUnsubscribe$.next();
    }

    // Scale operations for isolated can take a really long time.  When that happens, we'll show a warning
    // banner and isable the apply button so that they can't scale again until it's completed.
    private _pollForIsolatedScaleCompletion(resourceId: ResourceId) {
        const stopPolling$ = new Subject();
        const descriptor = new ArmResourceDescriptor(resourceId);

        const curBannerMessages: StatusMessage[] = [];

        this.specGroups.forEach(g => {
            curBannerMessages.push(g.bannerMessage);
            g.bannerMessage = {
                message: this._ts.instant(PortalResources.pricing_planScaleInProgress).format(descriptor.resourceName),
                level: 'warning'
            };
        });

        this._specPicker.disableUpdates = true;

        Observable.timer(0, 10000)
            .takeUntil(stopPolling$.merge(this._ngUnsubscribe$))
            .switchMap(t => {
                return this._planService.getPlan(resourceId, true);
            })
            .filter(p => {
                return (p.isSuccessful && p.result.properties.provisioningState !== 'InProgress')
                    || !p.isSuccessful;
            })
            .do(p => {
                this._specPicker.disableUpdates = true;

                this.specGroups.forEach((g, i) => {
                    g.bannerMessage = curBannerMessages[i];
                });

                stopPolling$.next();
            });
    }

    private _getBillingMeters(inputs: SpecPickerInput<NewPlanSpecPickerData>) {
        // If we're getting meters for an existing plan
        if (!inputs.data) {

            return this._planService.getPlan(inputs.id, true)
                .switchMap(r => {

                    if (r.isSuccessful) {
                        this._plan = r.result;

                        if (this._plan.sku.name === 'Y1') {
                            this._specPicker.statusMessage = {
                                message: this._ts.instant(PortalResources.pricing_notAvailableConsumption),
                                level: 'error'
                            };

                            this._specPicker.shieldEnabled = true;
                        }
                    } else {
                        this._specPicker.statusMessage = {
                            message: this._ts.instant(PortalResources.pricing_noWritePermissionsOnPlan),
                            level: 'error'
                        };

                        this._specPicker.shieldEnabled = true;

                        return Observable.of(null);
                    }

                    return this._planService.getBillingMeters(this._subscriptionId, this._plan.location);
                });
        }

        // We're getting meters for a new plan
        return this._planService.getBillingMeters(inputs.data.subscriptionId, inputs.data.location);
    }

    private _updatePriceStrings(result: SpecCostQueryResult, specs: PriceSpec[]) {
        specs.forEach(spec => {
            const costResult = result.costs.find(c => c.id === spec.specResourceSet.id);
            if (costResult.amount === 0.0) {
                spec.priceString = 'Free';
            } else {
                const meter = costResult.firstParty[0].meters[0];
                spec.priceString = this._ts.instant(PortalResources.pricing_pricePerHour).format(meter.perUnitAmount, meter.perUnitCurrencyCode);
            }
        });
    }


    private _cleanUpGroups() {
        let nonEmptyGroupIndex = 0;
        let foundNonEmptyGroup = false;

        // Remove hidden and forbidden specs and move disabled specs to end of list.
        this.specGroups.forEach((g, i) => {

            let recommendedSpecs = g.recommendedSpecs.filter(s => s.state !== 'hidden');
            let specs = g.additionalSpecs.filter(s => s.state !== 'hidden');

            recommendedSpecs = this._filterOutForbiddenSkus(this._inputs, recommendedSpecs);
            specs = this._filterOutForbiddenSkus(this._inputs, specs);

            g.recommendedSpecs = recommendedSpecs;
            g.additionalSpecs = specs;

            // Find if there's already a spec that's selected within a group.  Otherwise
            // just choose the first spec you can find
            g.selectedSpec = this._findSelectedSpec(g.recommendedSpecs);
            if (!g.selectedSpec) {
                g.selectedSpec = this._findSelectedSpec(g.additionalSpecs);
            }

            if (!g.selectedSpec && g.recommendedSpecs.length > 0) {
                g.selectedSpec = g.recommendedSpecs[0];
            }

            if (!g.selectedSpec && g.additionalSpecs.length > 0) {
                g.selectedSpec = g.additionalSpecs[0];
            }

            // Expand if selected spec is in the "all specs" list
            g.isExpanded = g.selectedSpec && g.additionalSpecs.find(s => s === g.selectedSpec) ? true : false;

            if (!foundNonEmptyGroup && g.recommendedSpecs.length === 0 && g.additionalSpecs.length === 0) {
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

            // Find the first group with a selectedSpec and make that group the default
            for (let i = nonEmptyGroupIndex; i < this.specGroups.length; i++) {
                if (this.specGroups[i].selectedSpec) {
                    this.selectedSpecGroup = this.specGroups[i];
                    break;
                }
            }
        }

        // If an isolated plan is currently being scaled, then poll for completion
        if (this._plan
            && this._plan.properties.hostingEnvironmentProfile
            && this._plan.properties.provisioningState === 'InProgress') {
            this._pollForIsolatedScaleCompletion(this._plan.id);
        }
    }

    private _findSelectedSpec(specs: PriceSpec[]) {
        return specs.find((s, specIndex) => {
            return (this._plan && s.skuCode.toLowerCase() === this._plan.sku.name.toLowerCase())
                || (this._inputs.data && this._inputs.data.selectedLegacySkuName === s.legacySkuName);
        });
    }

    private _filterOutForbiddenSkus(inputs: SpecPickerInput<NewPlanSpecPickerData>, specs: PriceSpec[]) {
        if (inputs.data && inputs.data.forbiddenSkus) {
            return specs
                .filter(s => !this._inputs.data.forbiddenSkus
                    .find(sku => sku.toLowerCase() === s.legacySkuName.toLowerCase()));
        }

        return specs;
    }
}
