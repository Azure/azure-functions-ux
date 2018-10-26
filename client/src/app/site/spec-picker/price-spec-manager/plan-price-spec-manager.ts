import { OsType } from './../../../shared/models/arm/stacks';
import { Observable } from 'rxjs/Observable';
import { LogService } from 'app/shared/services/log.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { SpecPickerComponent } from './../spec-picker.component';
import { SpecCostQueryResult, SpecResourceSet } from './../price-spec-manager/billing-models';
import {
  PriceSpecGroup,
  PriceSpecGroupType,
  DevSpecGroup,
  ProdSpecGroup,
  IsolatedSpecGroup,
  BannerMessage,
  BannerMessageLevel,
} from './price-spec-group';
import { PortalService } from './../../../shared/services/portal.service';
import { PlanService } from './../../../shared/services/plan.service';
import { Injector, Injectable } from '@angular/core';
import { ArmSubcriptionDescriptor, ArmResourceDescriptor } from '../../../shared/resourceDescriptors';
import { ResourceId, ArmObj } from '../../../shared/models/arm/arm-obj';
import { ServerFarm } from '../../../shared/models/server-farm';
import { SpecCostQueryInput } from './billing-models';
import { PriceSpecInput, PriceSpec } from './price-spec';
import { Subject } from 'rxjs/Subject';
import { BillingMeter } from '../../../shared/models/arm/billingMeter';
import { LogCategories, Links } from '../../../shared/models/constants';
import { Tier } from './../../../shared/models/serverFarmSku';
import { AuthzService } from 'app/shared/services/authz.service';
import { AppKind } from 'app/shared/Utilities/app-kind';

export interface SpecPickerInput<T> {
  id: ResourceId;
  data?: T;
  specPicker: SpecPickerComponent;
}

export interface PlanSpecPickerData {
  subscriptionId: string;
  location: string;
  hostingEnvironmentName: string | null;
  allowAseV2Creation: boolean;
  forbiddenSkus: string[];
  isLinux: boolean;
  isXenon: boolean;
  isElastic?: boolean;
  selectedLegacySkuName: string; // Looks like "small_standard"
  selectedSkuCode?: string; // Can be set in update scenario for initial spec selection
}

export type ApplyButtonState = 'enabled' | 'disabled';

@Injectable()
export class PlanPriceSpecManager {
  private readonly DynamicSku = 'Y1';

  selectedSpecGroup: PriceSpecGroup;
  specGroups: PriceSpecGroup[] = [];

  get currentSkuCode(): string {
    if (!this._plan) {
      return null;
    }

    return this._plan.sku.name;
  }

  private _specPicker: SpecPickerComponent;
  private _plan: ArmObj<ServerFarm>;
  private _subscriptionId: string;
  private _inputs: SpecPickerInput<PlanSpecPickerData>;
  private _ngUnsubscribe$ = new Subject();

  constructor(
    private _authZService: AuthzService,
    private _planService: PlanService,
    private _portalService: PortalService,
    private _ts: TranslateService,
    private _logService: LogService,
    private _injector: Injector
  ) {}

  resetGroups() {
    this.specGroups = [
      new DevSpecGroup(this._injector, this),
      new ProdSpecGroup(this._injector, this),
      new IsolatedSpecGroup(this._injector, this),
    ];
  }

  initialize(inputs: SpecPickerInput<PlanSpecPickerData>) {
    this._specPicker = inputs.specPicker;
    this._inputs = inputs;
    this._subscriptionId = new ArmSubcriptionDescriptor(inputs.id).subscriptionId;
    this.selectedSpecGroup = this.specGroups[0];

    let specInitCalls: Observable<void>[] = [];
    return this._getPlan(inputs).switchMap(plan => {
      // plan is null for new plans
      this._plan = plan;

      // Initialize every spec for each spec group.  For most cards this is a no-op, but
      // some require special handling so that we know if we need to hide/disable a card.
      this.specGroups.forEach(g => {
        const priceSpecInput: PriceSpecInput = {
          specPickerInput: inputs,
          plan: this._plan,
          subscriptionId: this._subscriptionId,
        };

        g.initialize(priceSpecInput);
        specInitCalls = specInitCalls.concat(g.recommendedSpecs.map(s => s.initialize(priceSpecInput)));
        specInitCalls = specInitCalls.concat(g.additionalSpecs.map(s => s.initialize(priceSpecInput)));
      });

      return specInitCalls.length > 0 ? Observable.zip(...specInitCalls) : Observable.of(null);
    });
  }

  getSpecCosts() {
    return this._getBillingMeters(this._inputs)
      .switchMap(meters => {
        if (!meters) {
          return Observable.of(null);
        }
        let specResourceSets: SpecResourceSet[] = [];
        let specsToAllowZeroCost: string[] = [];

        this.specGroups.forEach(g => {
          g.recommendedSpecs.forEach(s => this._setBillingResourceId(s, meters));
          g.additionalSpecs.forEach(s => this._setBillingResourceId(s, meters));

          specResourceSets = this._concatValidResourceSets(specResourceSets, g.recommendedSpecs);
          specResourceSets = this._concatValidResourceSets(specResourceSets, g.additionalSpecs);

          specsToAllowZeroCost = specsToAllowZeroCost.concat(
            g.recommendedSpecs.filter(s => s.allowZeroCost).map(s => s.specResourceSet.id)
          );
          specsToAllowZeroCost = specsToAllowZeroCost.concat(g.additionalSpecs.filter(s => s.allowZeroCost).map(s => s.specResourceSet.id));
        });

        const query: SpecCostQueryInput = {
          subscriptionId: this._subscriptionId,
          specResourceSets: specResourceSets,
          specsToAllowZeroCost: specsToAllowZeroCost,
          specType: 'WebsitesExtension',
        };

        return this._portalService.getSpecCosts(query).do(result => {
          this.specGroups.forEach(g => {
            this._updatePriceStrings(result, g.recommendedSpecs);
            this._updatePriceStrings(result, g.additionalSpecs);
          });
        });
      })
      .catch(e => {
        this.specGroups.forEach(g => {
          this._updatePriceStrings(null, g.recommendedSpecs);
          this._updatePriceStrings(null, g.additionalSpecs);
        });

        this._logService.error(LogCategories.specPicker, '/get-spec-costs', `Failed to get/set price for specs: ${e}`);
        return Observable.of(null);
      });
  }

  applySelectedSpec(): Observable<ApplyButtonState> {
    const planToUpdate: ArmObj<ServerFarm> = JSON.parse(JSON.stringify(this._plan));
    planToUpdate.sku = {
      name: this.selectedSpecGroup.selectedSpec.skuCode,
    };

    let notificationId: string = null;
    const planDescriptor = new ArmResourceDescriptor(planToUpdate.id);
    return this._portalService
      .startNotification(
        this._ts.instant(PortalResources.pricing_planUpdateTitle),
        this._ts.instant(PortalResources.pricing_planUpdateDesc).format(planDescriptor.resourceName)
      )
      .first()
      .switchMap(notification => {
        notificationId = notification.id;
        return this._planService.updatePlan(planToUpdate);
      })
      .map(r => {
        if (r.isSuccessful) {
          this._plan = r.result.json();
          this.cleanUpGroups();

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

          this.selectedSpecGroup.selectedSpec.updateUpsellBanner();
        } else {
          this._portalService.stopNotification(
            notificationId,
            r.isSuccessful,
            r.error.message
              ? r.error.message
              : this._ts.instant(PortalResources.pricing_planUpdateFailFormat).format(planDescriptor.resourceName)
          );
        }

        return <ApplyButtonState>'enabled';
      });
  }

  cleanUpGroups() {
    let nonEmptyGroupIndex = 0;
    let foundNonEmptyGroup = false;
    let foundDefaultGroup = false;

    // Remove hidden and forbidden specs and move disabled specs to end of list.
    this.specGroups.forEach((g, i) => {
      let recommendedSpecs = g.recommendedSpecs.filter(s => s.state !== 'hidden');
      let specs = g.additionalSpecs.filter(s => s.state !== 'hidden');

      recommendedSpecs = this._filterOutForbiddenSkus(this._inputs, recommendedSpecs);
      specs = this._filterOutForbiddenSkus(this._inputs, specs);

      g.recommendedSpecs = recommendedSpecs;
      g.additionalSpecs = specs;

      const allSpecs = [...g.recommendedSpecs, ...g.additionalSpecs];

      // Find if there's a spec in any group that matches the selectedSkuCode or selectedLegacySkuName
      g.selectedSpec = this._findSelectedSpec(allSpecs);
      if (!g.selectedSpec) {
        // Find if there's a spec in any group that matches the plan sku
        g.selectedSpec = this._findPlanSpec(allSpecs);
      }

      // If a plan's sku matches a spec in the current group, then make that group the default group
      if (g.selectedSpec && !foundDefaultGroup) {
        foundDefaultGroup = true;
        this.selectedSpecGroup = this.specGroups[i];
      }

      // If we still haven't found a default spec in the group, pick the first recommended one
      if (!g.selectedSpec && g.recommendedSpecs.length > 0) {
        g.selectedSpec = g.recommendedSpecs[0];
      }

      // If we still haven't found a defautl spec in the group, pick the first additional one
      if (!g.selectedSpec && g.additionalSpecs.length > 0) {
        g.selectedSpec = g.additionalSpecs[0];
      }

      // Expand if selected spec is in the "all specs" list or all of the specs in the recommended list are disabled.
      g.isExpanded =
        (g.selectedSpec && g.additionalSpecs.find(s => s === g.selectedSpec)) || !g.recommendedSpecs.some(s => s.state === 'enabled')
          ? true
          : false;

      if (!foundNonEmptyGroup && g.recommendedSpecs.length === 0 && g.additionalSpecs.length === 0) {
        nonEmptyGroupIndex++;
      } else {
        foundNonEmptyGroup = true;
      }
    });

    if (!foundDefaultGroup && nonEmptyGroupIndex < this.specGroups.length) {
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
    if (this._plan && this._plan.properties.hostingEnvironmentProfile && this._plan.properties.provisioningState === 'InProgress') {
      this._pollForIsolatedScaleCompletion(this._plan.id);
    }
  }

  // The lifetime of the spec manager really should be tied to the spec picker component, which is why we allow
  // components to dispose when they're ready.
  dispose() {
    this._ngUnsubscribe$.next();
  }

  setSelectedSpec(spec: PriceSpec) {
    this.selectedSpecGroup.selectedSpec = spec;

    // plan is null for new plans
    if (this._plan) {
      const tier = this._plan.sku.tier;
      if ((tier === Tier.premiumV2 && spec.tier !== Tier.premiumV2) || (tier !== Tier.premiumV2 && spec.tier === Tier.premiumV2)) {
        // show message when upgrading to PV2 or downgrading from PV2.
        this._specPicker.statusMessage = {
          message: this._ts.instant(PortalResources.pricing_pv2UpsellInfoMessage),
          level: 'info',
          infoLink: Links.pv2UpsellInfoLearnMore,
        };
      }
    }
  }

  checkAccess() {
    const resourceId = this._inputs.id;
    return Observable.zip(
      !this._inputs.data ? this._authZService.hasPermission(resourceId, [AuthzService.writeScope]) : Observable.of(true),
      !this._inputs.data ? this._authZService.hasReadOnlyLock(resourceId) : Observable.of(false)
    ).do(r => {
      if (!this._inputs.data) {
        const planDescriptor = new ArmResourceDescriptor(resourceId);
        const name = planDescriptor.parts[planDescriptor.parts.length - 1];

        if (!r[0]) {
          this._specPicker.statusMessage = {
            message: this._ts.instant(PortalResources.pricing_noWritePermissionsOnPlanFormat).format(name),
            level: 'error',
          };

          this._specPicker.shieldEnabled = true;
        } else if (r[1]) {
          this._specPicker.statusMessage = {
            message: this._ts.instant(PortalResources.pricing_planReadonlyLockFormat).format(name),
            level: 'error',
          };

          this._specPicker.shieldEnabled = true;
        }
      }
    });
  }

  updateUpsellBanner() {
    const prodSpecGroup = this._getSpecGroupById(PriceSpecGroupType.PROD);

    if (!prodSpecGroup.bannerMessage) {
      const currentSkuCode = this._plan && this._plan.sku.name.toLowerCase();

      if (currentSkuCode && this._hasUpsellEnableSkuCode(currentSkuCode, prodSpecGroup) && this._hasPremiumV2SkusEnabled(prodSpecGroup)) {
        const currentSpec = this._getSpecBySkuCodeInSpecGroup(currentSkuCode, prodSpecGroup);
        const currentSpecCost = currentSpec.price;
        const newSpec = this._getSpecBySkuCodeInSpecGroup(currentSpec.getUpsellSpecSkuCode(), prodSpecGroup);
        const newSpecCost = !!newSpec ? newSpec.price : 0;

        if (this._shouldShowUpsellRecommendation(currentSpecCost, newSpecCost)) {
          prodSpecGroup.bannerMessage = {
            message: this._ts.instant(PortalResources.pricing_upsellToPremiumV2Message),
            level: BannerMessageLevel.UPSELL,
            infoActionFn: () => {
              this.setSelectedSpec(newSpec);
            },
          };
        }
      }
    }
  }

  private _shouldShowUpsellRecommendation(currentSpecCost: number, newSpecCost: number): boolean {
    const costBuffer = 0.1 * currentSpecCost;
    const maxCost = costBuffer + currentSpecCost;

    return newSpecCost <= maxCost;
  }

  private _getSpecGroupById(id: PriceSpecGroupType): PriceSpecGroup {
    return this.specGroups.find(specGroup => specGroup.id === id);
  }

  private _getSpecBySkuCodeInSpecGroup(skuCode: string, specGroup: PriceSpecGroup): PriceSpec {
    const allSpecsInGroup = [...specGroup.recommendedSpecs, ...specGroup.additionalSpecs];
    return allSpecsInGroup.find(spec => spec.skuCode.toLowerCase() === skuCode.toLowerCase());
  }

  private _hasPremiumV2SkusEnabled(specGroup: PriceSpecGroup): boolean {
    const allSpecsInGroup = [...specGroup.recommendedSpecs, ...specGroup.additionalSpecs];
    return allSpecsInGroup.some(spec => spec.tier === Tier.premiumV2 && spec.state === 'enabled');
  }

  private _hasUpsellEnableSkuCode(currentSkuCode: string, specGroup: PriceSpecGroup): boolean {
    return this._getUpsellEnabledSkuCodesInSpecGroup(specGroup).some(skuCode => skuCode.toLowerCase() === currentSkuCode);
  }

  private _getUpsellEnabledSkuCodesInSpecGroup(specGroup: PriceSpecGroup): string[] {
    const allSpecsInGroup = [...specGroup.recommendedSpecs, ...specGroup.additionalSpecs];
    return allSpecsInGroup.filter(spec => spec.upsellEnabled).map(spec => spec.skuCode);
  }

  private _getPlan(inputs: SpecPickerInput<PlanSpecPickerData>) {
    if (this._isUpdateScenario(inputs)) {
      return this._planService.getPlan(inputs.id, true).map(r => {
        if (r.isSuccessful) {
          this._plan = r.result;

          if (this._plan.sku.name === this.DynamicSku) {
            this._specPicker.statusMessage = {
              message: this._ts.instant(PortalResources.pricing_notAvailableConsumption),
              level: 'error',
            };

            this._specPicker.shieldEnabled = true;
          }

          return r.result;
        } else {
          this._specPicker.statusMessage = {
            message: this._ts.instant(PortalResources.pricing_noWritePermissionsOnPlan),
            level: 'error',
          };

          this._specPicker.shieldEnabled = true;
        }

        return null;
      });
    }

    return Observable.of(null);
  }

  // Scale operations for isolated can take a really long time.  When that happens, we'll show a warning
  // banner and isable the apply button so that they can't scale again until it's completed.
  private _pollForIsolatedScaleCompletion(resourceId: ResourceId) {
    const stopPolling$ = new Subject();
    const descriptor = new ArmResourceDescriptor(resourceId);

    const curBannerMessages: BannerMessage[] = [];

    this.specGroups.forEach(g => {
      curBannerMessages.push(g.bannerMessage);
      g.bannerMessage = {
        message: this._ts.instant(PortalResources.pricing_planScaleInProgress).format(descriptor.resourceName),
        level: BannerMessageLevel.WARNING,
      };
    });

    this._specPicker.disableUpdates = true;

    Observable.timer(0, 10000)
      .takeUntil(stopPolling$.merge(this._ngUnsubscribe$))
      .switchMap(t => {
        return this._planService.getPlan(resourceId, true);
      })
      .filter(p => {
        return (p.isSuccessful && p.result.properties.provisioningState !== 'InProgress') || !p.isSuccessful;
      })
      .do(p => {
        this._specPicker.disableUpdates = true;

        this.specGroups.forEach((g, i) => {
          g.bannerMessage = curBannerMessages[i];
        });

        stopPolling$.next();
      });
  }

  private _concatValidResourceSets(allResourceSets: SpecResourceSet[], specs: PriceSpec[]) {
    return allResourceSets.concat(specs.filter(s => s.specResourceSet.firstParty[0].resourceId).map(s => s.specResourceSet));
  }

  private _getBillingMeters(inputs: SpecPickerInput<PlanSpecPickerData>) {
    if (this._isUpdateScenario(inputs)) {
      // If we're getting meters for an existing plan
      const osType = AppKind.hasKinds(this._plan, ['linux']) ? OsType.Linux : OsType.Windows;
      return this._planService.getBillingMeters(this._subscriptionId, osType, this._plan.location);
    }

    // We're getting meters for a new plan
    const osType = inputs.data.isLinux ? OsType.Linux : OsType.Windows;
    return this._planService.getBillingMeters(inputs.data.subscriptionId, osType, inputs.data.location);
  }

  private _setBillingResourceId(spec: PriceSpec, billingMeters: ArmObj<BillingMeter>[]) {
    if (!spec.meterFriendlyName) {
      throw Error('meterFriendlyName must be set');
    }

    if (!spec.specResourceSet || !spec.specResourceSet.firstParty || spec.specResourceSet.firstParty.length !== 1) {
      throw Error('Spec must contain a specResourceSet with one firstParty item defined');
    }

    const billingMeter = billingMeters.find(m => m.properties.shortName.toLowerCase() === spec.skuCode.toLowerCase());

    if (!billingMeter) {
      this._logService.error(LogCategories.specPicker, '/meter-not-found', `No meter found for ${spec.meterFriendlyName}`);
      return;
    }

    spec.specResourceSet.firstParty[0].resourceId = billingMeter.properties.meterId;
  }

  private _updatePriceStrings(result: SpecCostQueryResult, specs: PriceSpec[]) {
    specs.forEach(spec => {
      const costResult = result && result.costs.find(c => c.id === spec.specResourceSet.id);
      if (!costResult) {
        // Set to empty string so that UI knows the difference between loading and no value which can happen for CSP subscriptions
        spec.priceString = ' ';
      } else if (costResult.amount === 0.0) {
        spec.priceString = this._ts.instant(PortalResources.free);
        spec.price = 0;
      } else {
        const meter = costResult.firstParty[0].meters[0];
        spec.price = meter.perUnitAmount * 744; // 744 hours in a month
        const rate = spec.price.toFixed(2);
        spec.priceString = this._ts.instant(PortalResources.pricing_pricePerMonth).format(rate, meter.perUnitCurrencyCode);
      }
    });
  }

  private _findSelectedSpec(specs: PriceSpec[]) {
    // NOTE(shimedh): The order of checks should always be as below.
    return specs.find((s, specIndex) => {
      return (
        (this._inputs.data &&
          this._inputs.data.selectedSkuCode &&
          this._inputs.data.selectedSkuCode.toLowerCase() === s.skuCode.toLowerCase()) ||
        (this._inputs.data && this._inputs.data.selectedLegacySkuName === s.legacySkuName)
      );
    });
  }

  private _findPlanSpec(specs: PriceSpec[]) {
    return specs.find((s, specIndex) => {
      return this._plan && s.skuCode.toLowerCase() === this._plan.sku.name.toLowerCase();
    });
  }

  private _filterOutForbiddenSkus(inputs: SpecPickerInput<PlanSpecPickerData>, specs: PriceSpec[]) {
    if (inputs.data && inputs.data.forbiddenSkus) {
      return specs.filter(s => !this._inputs.data.forbiddenSkus.find(sku => sku.toLowerCase() === s.legacySkuName.toLowerCase()));
    }

    return specs;
  }

  private _isUpdateScenario(inputs: SpecPickerInput<PlanSpecPickerData>): boolean {
    return !inputs.data || (inputs.data && !!inputs.data.selectedSkuCode);
  }
}
