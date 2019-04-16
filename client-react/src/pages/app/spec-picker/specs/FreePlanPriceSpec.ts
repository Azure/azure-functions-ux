import { AvailableSku, ArmObj, GeoRegion, ArmArray } from '../../../../models/WebAppModels';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../utils/AppKind';
import { PriceSpec, PriceSpecInput, SpecColorCodes } from './PriceSpec';
import MakeArmCall from '../../../../ApiHelpers/ArmHelper';
import { ArmProviderInfo } from '../../../../models/HttpResult';
import Url from '../../../../utils/url';
import { style } from 'typestyle';
import i18next from 'i18next';

export abstract class FreePlanPriceSpec extends PriceSpec {
  constructor(t: i18next.TFunction) {
    super(t);
    this.tier = ServerFarmSkuConstants.Tier.free;
    this.skuCode = ServerFarmSkuConstants.SkuCode.Free.F1;
    this.legacySkuName = 'free';
    this.topLevelFeatures = [t('pricing_sharedInfrastructure'), t('pricing_memory').format(1), t('pricing_computeLimit').format(60)];

    this.featureItems = [];

    this.hardwareItems = [
      {
        id: 'pricing_includedHardware_azureComputeUnits',
        iconUrl: 'image/app-service-plan.svg',
        title: t('pricing_includedHardware_azureComputeUnits'),
        description: t('pricing_computeDedicatedAcu'),
        learnMoreUrl: CommonConstants.Links.azureComputeUnitLearnMore,
      },
      {
        id: 'memory',
        iconUrl: 'image/website-power.svg',
        title: t('memory'),
        description: t('pricing_sharedMemory'),
      },
      {
        id: 'storage',
        iconUrl: 'image/storage.svg',
        title: t('storage'),
        description: t('pricing_sharedDisk').format('1 GB'),
      },
    ];

    this.specResourceSet = {
      id: this.skuCode,
      firstParty: [
        {
          quantity: 744,
        },
      ],
    };

    this.cssClass = style({
      background: SpecColorCodes.FREE,
    });

    this.allowZeroCost = true;
  }

  public async runInitialization(input: PriceSpecInput): Promise<void> {
    const allowFreeLinux = Url.getParameterByName(null, CommonConstants.FeatureFlags.AllowFreeLinux);
    if (input.plan) {
      if (
        input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.isXenon ||
        AppKind.hasAnyKind(input.plan, [CommonConstants.Kinds.elastic]) ||
        (!allowFreeLinux && AppKind.hasAnyKind(input.plan, [CommonConstants.Kinds.linux]))
      ) {
        this.state = 'hidden';
      }

      return this._checkIfSkuEnabledOnStamp(input.plan.id);
    }

    if (input.specPickerInput.data) {
      if (
        input.specPickerInput.data.hostingEnvironmentName ||
        input.specPickerInput.data.isXenon ||
        input.specPickerInput.data.isElastic ||
        (!allowFreeLinux && input.specPickerInput.data.isLinux)
      ) {
        this.state = 'hidden';
      }

      return this._checkIfSkuEnabledInRegion(
        input.subscriptionId,
        input.specPickerInput.data ? input.specPickerInput.data.location : '',
        input.specPickerInput.data ? input.specPickerInput.data.isLinux : false
      );
    }
  }

  private async _checkIfSkuEnabledOnStamp(resourceId: string): Promise<void> {
    if (this.state !== 'hidden') {
      const availableSkuFetch = await MakeArmCall<{ value: AvailableSku[] }>({
        resourceId,
        commandName: '_checkIfSkuEnabledOnStamp',
      });

      const result = availableSkuFetch;
      this.state = result.data.value.find(s => s.sku.name === this.tier) ? 'enabled' : 'disabled';

      if (this.state === 'disabled') {
        this.disabledMessage = this._t('pricing_freeLinuxNotAvailable');
      }
    }
  }

  private async _checkIfSkuEnabledInRegion(subscriptionId: string, location: string, isLinux: boolean): Promise<void> {
    if (this.state === 'enabled') {
      const locations = await this._getProviderLocations(subscriptionId, 'serverFarms');
      const geoRegionsForSku = await this._getAllGeoRegionsForSku(subscriptionId, this.tier, isLinux);

      const geoRegions = this._getAvailableGeoRegionsList(locations, geoRegionsForSku);
      if (!geoRegions.find(g => g.properties.name.toLowerCase() === location.toLowerCase())) {
        this.state = 'disabled';
        this.disabledMessage = this._t('pricing_freeLinuxNotAvailable');
      }
    }
  }

  private async _getProviderLocations(subscriptionId: string, resourceType: string): Promise<string[]> {
    const resourceId = `/subscriptions/${subscriptionId}/providers/microsoft.web`;
    const providerLocationsFetch = await MakeArmCall<{ value: ArmProviderInfo }>({
      resourceId,
      commandName: '_getProviderLocations',
      apiVersion: CommonConstants.ApiVersions.websiteApiVersion20181101,
    });

    const result = providerLocationsFetch;
    const resource =
      result &&
      result.data.value &&
      result.data.value.resourceTypes &&
      result.data.value.resourceTypes.find(t => t.resourceType.toLowerCase() === resourceType.toLowerCase());

    return !!resource ? resource.locations : [];
  }

  private async _getAllGeoRegionsForSku(subscriptionId: string, sku: string, isLinux: boolean): Promise<ArmObj<GeoRegion>[]> {
    const id = `/subscriptions/${subscriptionId}/providers/microsoft.web/georegions`;

    const geoRegionsFetch = await MakeArmCall<ArmArray<GeoRegion>>({
      resourceId: id,
      commandName: '_getProviderLocations',
      apiVersion: CommonConstants.ApiVersions.websiteApiVersion20181101,
      queryString: isLinux ? `sku=${sku}&linuxWorkersEnabled=true` : `sku=${sku}`,
    });

    return geoRegionsFetch.data.value;
  }

  private _getAvailableGeoRegionsList(providerLocations: string[], geoRegions: ArmObj<GeoRegion>[]) {
    const itemsToRemove: ArmObj<GeoRegion>[] = [];
    geoRegions.forEach(geoRegion => {
      if (providerLocations.indexOf(geoRegion.properties.displayName) === -1) {
        itemsToRemove.push(geoRegion);
      }
    });

    return geoRegions.filter(geoRegion => itemsToRemove.indexOf(geoRegion) === -1);
  }
}
