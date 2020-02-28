import { CommonConstants } from '../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../utils/AppKind';
import { PriceSpec, PriceSpecInput, SpecColorCodes } from './PriceSpec';
import MakeArmCall from '../../../../ApiHelpers/ArmHelper';
import { ArmProviderInfo } from '../../../../models/HttpResult';
import { style } from 'typestyle';
import i18next from 'i18next';
import { AvailableSku, ArmObj, ArmArray } from '../../../../models/arm-obj';
import { GeoRegion } from '../../../../models/georegions';

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
          id: this.skuCode,
          quantity: CommonConstants.Pricing.hoursInAzureMonth,
        },
      ],
    };

    this.cssClass = style({
      background: SpecColorCodes.FREE,
    });

    this.allowZeroCost = true;
  }

  public async runInitialization(input: PriceSpecInput): Promise<void> {
    let isLinux = false;
    if (input.plan) {
      isLinux = AppKind.hasAnyKind(input.plan, [CommonConstants.Kinds.linux]);
      if (isLinux) {
        this.topLevelFeatures.shift();
      }
      if (
        input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.hyperV ||
        AppKind.hasAnyKind(input.plan, [CommonConstants.Kinds.elastic])
      ) {
        this.state = 'hidden';
      }

      return this._checkIfSkuEnabledOnStamp(input.plan.id);
    }

    if (input.specPickerInput.data) {
      isLinux = input.specPickerInput.data.isLinux;
      if (isLinux) {
        this.topLevelFeatures.shift();
      }
      if (
        input.specPickerInput.data.hostingEnvironmentName ||
        input.specPickerInput.data.isXenon ||
        input.specPickerInput.data.hyperV ||
        (input.specPickerInput.data.isNewFunctionAppCreate && input.specPickerInput.data.isElastic)
      ) {
        this.state = 'hidden';
      }

      return this._checkIfSkuEnabledInRegion(
        input.subscriptionId,
        input.specPickerInput.data ? input.specPickerInput.data.location : '',
        input.specPickerInput.data ? isLinux : false
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
      this.state = result.data.value.find(s => s.sku.tier === this.tier) ? 'enabled' : 'disabled';

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
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
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
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
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
