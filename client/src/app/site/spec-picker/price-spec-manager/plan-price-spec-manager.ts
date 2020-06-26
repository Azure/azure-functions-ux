import { OsType } from './../../../shared/models/arm/stacks';
import { Observable } from 'rxjs/Observable';
import { LogService } from 'app/shared/services/log.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { SpecPickerComponent } from './../spec-picker.component';
import {
  SpecCostQueryResult,
  SpecResourceSet,
  SpecCostQueryResultStatusCode,
  SpecCostQueryResultSpecStatusCode,
} from './../price-spec-manager/billing-models';
import {
  PriceSpecGroup,
  PriceSpecGroupType,
  DevSpecGroup,
  ProdSpecGroup,
  IsolatedSpecGroup,
  BannerMessage,
  BannerMessageLevel,
  GenericSpecGroup,
  SpecGroup,
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
import { LogCategories, Links, ScenarioIds, Constants } from '../../../shared/models/constants';
import { Tier, SkuCode } from './../../../shared/models/serverFarmSku';
import { AuthzService } from 'app/shared/services/authz.service';
import { AppKind } from 'app/shared/Utilities/app-kind';
import { BillingService } from 'app/shared/services/billing.service';
import { ScenarioService } from 'app/shared/services/scenario/scenario.service';

export interface SpecPickerInput<T> {
  id: ResourceId;
  data?: T;
  specPicker: SpecPickerComponent;
}

export interface StampIpAddresses {
  inboundIpAddress: string;
  possibleInboundIpAddresses: string;
  outboundIpAddresses: string;
  possibleOutboundIpAddresses: string;
}

export interface PlanSpecPickerData {
  returnObjectResult?: boolean;
  subscriptionId: string;
  location: string;
  hostingEnvironmentName: string | null;
  allowAseV2Creation: boolean;
  forbiddenSkus: string[];
  forbiddenComputeMode?: number;
  isFunctionApp?: boolean;
  isLinux: boolean;
  isXenon: boolean;
  hyperV: boolean;
  selectedLegacySkuName: string; // Looks like "small_standard"
  selectedSkuCode?: string; // Can be set in update scenario for initial spec selection
  isElastic?: boolean;
  isNewFunctionAppCreate?: boolean; // NOTE(shimedh): We need this additional flag temporarily to make it work with old and new FunctionApp creates.
  // Since old creates always shows elastic premium sku's along with other sku's.
  // However, in new full screen creates it would be based on the plan type selected which will determing isElastic boolean value.
}

export type ApplyButtonState = 'enabled' | 'disabled';

@Injectable()
export class PlanPriceSpecManager {
  private readonly DynamicSku = 'Y1';
  private readonly StampIpAddressesDelimeter = ',';

  selectedSpecGroup: PriceSpecGroup;
  specGroups: PriceSpecGroup[] = [];
  specSpecificBanner: BannerMessage;

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
  private _numberOfSites = 0;
  private _stampIpAddresses: StampIpAddresses;

  constructor(
    private _authZService: AuthzService,
    private _planService: PlanService,
    private _portalService: PortalService,
    private _ts: TranslateService,
    private _logService: LogService,
    private _injector: Injector,
    private _scenarioService: ScenarioService,
    private _billingService: BillingService
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

    let pricingTiers = Observable.of(null);
    if (this._scenarioService.checkScenario(ScenarioIds.pricingTierApiEnabled).status === 'enabled') {
      pricingTiers = this._billingService.getPricingTiers(this._subscriptionId);
    }

    this.selectedSpecGroup = this.specGroups[0];
    let specInitCalls: Observable<void>[] = [];

    return Observable.zip(this._getPlan(inputs), pricingTiers, (plan, pt) => ({
      plan: plan,
      pricingTiers: pt,
    }))
      .flatMap(r => {
        // plan is null for new plans
        this._plan = r.plan;

        if (r.pricingTiers) {
          this.specGroups = [
            new GenericSpecGroup(this._injector, this, SpecGroup.Development, r.pricingTiers),
            new GenericSpecGroup(this._injector, this, SpecGroup.Production, r.pricingTiers),
          ];
        }
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
      })
      .do(() => {
        return this._getServerFarmSites(inputs);
      });
  }

  getSpecCosts() {
    if (this._scenarioService.checkScenario(ScenarioIds.pricingTierApiEnabled).status === 'enabled') {
      // Spec costs is supplied by Pricing Tier api in OnPrem Environment
      return Observable.of(null);
    }
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

          specResourceSets = this._concatAllResourceSetsForSpecs(specResourceSets, g.recommendedSpecs);
          specResourceSets = this._concatAllResourceSetsForSpecs(specResourceSets, g.additionalSpecs);

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
          this._updateAppDensityStatusMessage(this.selectedSpecGroup.selectedSpec);
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

      // If we still haven't found a default spec in the group, pick the first enabled recommended one
      const firstEnabledRecommendedSpec = this._findFirstEnabledSpecIndex(g.recommendedSpecs);
      if (!g.selectedSpec && g.recommendedSpecs.length > 0 && firstEnabledRecommendedSpec > -1) {
        g.selectedSpec = g.recommendedSpecs[firstEnabledRecommendedSpec];
      }

      // If we still haven't found a defautl spec in the group, pick the first enabled additional one
      const firstEnabledAdditionalSpec = this._findFirstEnabledSpecIndex(g.additionalSpecs);
      if (!g.selectedSpec && g.additionalSpecs.length > 0 && firstEnabledAdditionalSpec > -1) {
        g.selectedSpec = g.additionalSpecs[firstEnabledAdditionalSpec];
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

      this._updateAppDensityStatusMessage(spec);
      const possibleInboundIpAddresses = this._stampIpAddresses.possibleInboundIpAddresses.split(this.StampIpAddressesDelimeter);
      const isFlexStamp = possibleInboundIpAddresses.length > 1;

      if (
        isFlexStamp &&
        ((tier === Tier.premiumV2 && spec.tier !== Tier.premiumV2) || (tier !== Tier.premiumV2 && spec.tier === Tier.premiumV2))
      ) {
        const possibleOutboundIpAddresses = this._stampIpAddresses.possibleOutboundIpAddresses.split(this.StampIpAddressesDelimeter);
        const inboundIpAddresses = this._stampIpAddresses.inboundIpAddress.split(this.StampIpAddressesDelimeter);
        const outboundIpAddresses = this._stampIpAddresses.outboundIpAddresses.split(this.StampIpAddressesDelimeter);

        // show flex stamp message when upgrading to PV2 or downgrading from PV2 if it is flex stamp.
        this._specPicker.statusMessage = {
          message: this._ts.instant(PortalResources.pricing_pv2FlexStampCheckboxLabel),
          level: 'info',
          infoLink: Links.pv2FlexStampInfoLearnMore,
          showCheckbox: true,
          infoLinkAriaLabel: this._ts.instant(PortalResources.pricing_pv2FlexStampCheckboxAriaLabel),
        };

        this.specSpecificBanner = {
          level: BannerMessageLevel.INFO,
          message: this._ts.instant(PortalResources.pricing_pv2FlexStampInfoMessage, {
            inbound: possibleInboundIpAddresses
              .filter(
                possibleInboundIpAddress => !inboundIpAddresses.find(inboundIpAddress => inboundIpAddress === possibleInboundIpAddress)
              )
              .join(this.StampIpAddressesDelimeter),
            outbound: possibleOutboundIpAddresses
              .filter(
                possibleOutboundIpAddress => !outboundIpAddresses.find(outboundIpAddress => outboundIpAddress === possibleOutboundIpAddress)
              )
              .join(this.StampIpAddressesDelimeter),
          }),
        };
      } else {
        this.specSpecificBanner = null;
        const shouldShowUpsellStatusMessage =
          !this._specPicker.statusMessage ||
          (this._specPicker.statusMessage.level !== 'warning' && this._specPicker.statusMessage.level !== 'error');

        if (
          (shouldShowUpsellStatusMessage && (tier === Tier.premiumV2 && spec.tier !== Tier.premiumV2)) ||
          (tier !== Tier.premiumV2 && spec.tier === Tier.premiumV2)
        ) {
          // show message when upgrading to PV2 or downgrading from PV2.
          this._specPicker.statusMessage = {
            message: this._ts.instant(PortalResources.pricing_pv2UpsellInfoMessage),
            level: 'info',
            infoLink: Links.pv2UpsellInfoLearnMore,
            infoLinkAriaLabel: this._ts.instant(PortalResources.pricing_pv2UpsellInfoMessageAriaLabel),
          };
        }
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

  private _shouldShowAppDensityWarning(skuCode: string): boolean {
    return (
      this._scenarioService.checkScenario(ScenarioIds.appDensity).status !== 'disabled' &&
      this._isAppDensitySkuCode(skuCode) &&
      this._numberOfSites >= Constants.appDensityLimit
    );
  }

  private _isAppDensitySkuCode(skuCode: string): boolean {
    const upperCaseSkuCode = skuCode.toUpperCase();
    return (
      upperCaseSkuCode === SkuCode.Basic.B1 ||
      upperCaseSkuCode === SkuCode.Standard.S1 ||
      upperCaseSkuCode === SkuCode.Premium.P1 ||
      upperCaseSkuCode === SkuCode.PremiumContainer.PC2 ||
      upperCaseSkuCode === SkuCode.PremiumV2.P1V2 ||
      upperCaseSkuCode === SkuCode.Isolated.I1 ||
      upperCaseSkuCode === SkuCode.ElasticPremium.EP1
    );
  }

  private _updateAppDensityStatusMessage(spec: PriceSpec) {
    if (this._shouldShowAppDensityWarning(spec.skuCode)) {
      this._specPicker.statusMessage = {
        message: this._ts.instant(PortalResources.pricing_appDensityWarningMessage).format(this._plan.name),
        level: 'warning',
        infoLink: Links.appDensityWarningLink,
        infoLinkAriaLabel: this._ts.instant(PortalResources.pricing_appDensityWarningMessageAriaLabel),
      };
    }
  }

  private _findFirstEnabledSpecIndex(specs: PriceSpec[]): number {
    return specs.findIndex(spec => spec.state === 'enabled');
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

  private _getServerFarmSites(inputs: SpecPickerInput<PlanSpecPickerData>) {
    if (this._isUpdateScenario(inputs)) {
      this._numberOfSites = 0;
      this._stampIpAddresses = null;
      return this._planService.getServerFarmSites(inputs.id, true).subscribe(
        response => {
          if (response.isSuccessful) {
            this._numberOfSites = this._numberOfSites + response.result.value.length;
            this._stampIpAddresses = {
              inboundIpAddress: response.result.value[0].properties.inboundIpAddress,
              outboundIpAddresses: response.result.value[0].properties.outboundIpAddresses,
              possibleInboundIpAddresses: response.result.value[0].properties.possibleInboundIpAddresses,
              possibleOutboundIpAddresses: response.result.value[0].properties.possibleOutboundIpAddresses,
            };
          }
        },
        null,
        () => {
          this._updateAppDensityStatusMessage(this.selectedSpecGroup.selectedSpec);
        }
      );
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

  private _concatAllResourceSetsForSpecs(allResourceSets: SpecResourceSet[], specs: PriceSpec[]) {
    const specsFiltered = specs.filter(spec => {
      return (
        !!spec.specResourceSet &&
        !!spec.specResourceSet.firstParty &&
        !!spec.specResourceSet.firstParty.length &&
        spec.specResourceSet.firstParty.filter(f => !f.resourceId).length === 0
      );
    });

    return allResourceSets.concat(specsFiltered.map(s => s.specResourceSet));
  }

  private _getBillingMeters(inputs: SpecPickerInput<PlanSpecPickerData>) {
    const osType = this._getOsType(inputs);
    if (this._isUpdateScenario(inputs)) {
      // If we're getting meters for an existing plan
      return this._planService.getBillingMeters(this._subscriptionId, osType, this._plan.location);
    }

    // We're getting meters for a new plan
    return this._planService.getBillingMeters(inputs.data.subscriptionId, osType, inputs.data.location);
  }

  private _getOsType(inputs: SpecPickerInput<PlanSpecPickerData>): OsType {
    if (this._isUpdateScenario(inputs)) {
      // If we're getting meters for an existing plan
      return AppKind.hasKinds(this._plan, ['linux']) ? OsType.Linux : OsType.Windows;
    }

    // We're getting meters for a new plan
    return inputs.data.isLinux ? OsType.Linux : OsType.Windows;
  }

  private _setBillingResourceId(spec: PriceSpec, billingMeters: ArmObj<BillingMeter>[]) {
    if (!spec.meterFriendlyName) {
      throw Error('meterFriendlyName must be set');
    }

    if (!spec.specResourceSet || !spec.specResourceSet.firstParty || spec.specResourceSet.firstParty.length < 1) {
      throw Error('Spec must contain a specResourceSet with at least one firstParty item defined');
    }

    spec.specResourceSet.firstParty.forEach(firstPartyResource => {
      let billingMeter: ArmObj<BillingMeter>;
      if (!!firstPartyResource.id) {
        billingMeter = billingMeters.find(m => m.properties.shortName.toLowerCase() === firstPartyResource.id.toLowerCase());
      }
      if (!billingMeter) {
        // TODO(shimedh): Remove condition for Free Linux once billingMeters API is updated by backend to return the meters correctly.
        const osType = this._getOsType(this._inputs);
        if (osType === OsType.Linux && spec.skuCode === SkuCode.Free.F1) {
          spec.specResourceSet.firstParty[0].resourceId = 'a90aec9f-eecb-42c7-8421-9b96716996dc';
        } else {
          this._logService.error(LogCategories.specPicker, '/meter-not-found', {
            firstPartyResourceMeterId: firstPartyResource.id,
            skuCode: spec.skuCode,
            osType: osType,
            location: this._isUpdateScenario(this._inputs) ? this._plan.location : this._inputs.data.location,
          });
        }
      } else {
        firstPartyResource.resourceId = billingMeter.properties.meterId;
      }
    });
  }

  private _updatePriceStrings(result: SpecCostQueryResult, specs: PriceSpec[]) {
    specs.forEach(spec => {
      // Check if the overall result of getSpecCosts has success status code.
      if (result && this._isSpecCostQueryResultSuccess(result.statusCode)) {
        const costResult = result.costs.find(c => c.id === spec.specResourceSet.id);
        if (!costResult || (costResult && !this._shouldShowPricing(costResult.statusCode))) {
          // Set to empty string so that UI knows the difference between loading and no value which can happen for CSP subscriptions
          spec.priceString = ' ';
        } else if (costResult.amount === 0.0) {
          spec.priceString = this._ts.instant(PortalResources.free);
          spec.price = 0;
        } else {
          spec.price = costResult.amount;
          const rate = spec.price.toFixed(2);
          spec.priceString = spec.priceIsBaseline
            ? this._ts.instant(PortalResources.pricing_pricePerMonthBaseline).format(rate, costResult.currencyCode)
            : this._ts.instant(PortalResources.pricing_pricePerMonth).format(rate, costResult.currencyCode);
        }
      } else {
        // Set to empty string so that UI knows the difference between loading and no value which can happen for CSP subscriptions
        spec.priceString = ' ';
      }
    });
  }

  private _isSpecCostQueryResultSuccess(statusCode: SpecCostQueryResultStatusCode): boolean {
    return (
      statusCode === SpecCostQueryResultStatusCode.Success ||
      statusCode === SpecCostQueryResultStatusCode.Partial ||
      statusCode === SpecCostQueryResultStatusCode.SuccessAsRetailForEa ||
      statusCode === SpecCostQueryResultStatusCode.SuccessAsRetailForNewEa
    );
  }

  private _shouldShowPricing(costResultStatusCode: SpecCostQueryResultSpecStatusCode): boolean {
    return (
      costResultStatusCode === SpecCostQueryResultSpecStatusCode.Success ||
      costResultStatusCode === SpecCostQueryResultSpecStatusCode.SuccessAsRetailForEa
    );
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
