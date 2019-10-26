import { ArmSku, AvailableSku } from './../../../../models/arm-obj';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { PriceSpec, PriceSpecInput, PlanSpecPickerData } from './PriceSpec';
import { ArmProviderInfo } from '../../../../models/HttpResult';
import MakeArmCall from '../../../../ApiHelpers/ArmHelper';
import i18next from 'i18next';
import { ArmObj, ArmArray } from '../../../../models/arm-obj';
import { ServerFarm } from '../../../../models/serverFarm/serverfarm';
import { GeoRegion } from '../../../../models/georegions';

export abstract class DV2SeriesPriceSpec extends PriceSpec {
  private readonly _sku: string;
  private readonly _skuNotAvailableMessage: string;
  private readonly _skuNotAvailableLink: string;
  constructor(t: i18next.TFunction, sku: string, skuNotAvailableMessage: string, skuNotAvailableLink: string) {
    super(t);
    this._sku = sku;
    this._skuNotAvailableMessage = skuNotAvailableMessage;
    this._skuNotAvailableLink = skuNotAvailableLink;
  }

  public async runInitialization(input: PriceSpecInput): Promise<void> {
    if (input.plan) {
      this.state = this._shouldHideForExistingPlan(input.plan) ? 'hidden' : this.state;

      await this._checkIfSkuEnabledOnStamp(input.plan.id);
      return this.checkIfDreamspark(input.subscriptionId);
    }

    if (input.specPickerInput.data) {
      this.state = this._shouldHideForNewPlan(input.specPickerInput.data) ? 'hidden' : this.state;

      await this.checkIfDreamspark(input.subscriptionId);
      return this._checkIfSkuEnabledInRegion(
        input.subscriptionId,
        input.specPickerInput.data ? input.specPickerInput.data.location : '',
        input.specPickerInput.data ? input.specPickerInput.data.isLinux : false
      );
    }
  }

  protected abstract _matchSku(sku: ArmSku): boolean;
  protected abstract _shouldHideForNewPlan(data: PlanSpecPickerData): boolean;
  protected abstract _shouldHideForExistingPlan(plan: ArmObj<ServerFarm>): boolean;

  private async _checkIfSkuEnabledOnStamp(resourceId: string): Promise<void> {
    if (this.state !== 'hidden') {
      const availableSkuFetch = await MakeArmCall<{ value: AvailableSku[] }>({
        resourceId,
        commandName: '_checkIfSkuEnabledOnStamp',
      });

      const result = availableSkuFetch;
      this.state = result.data.value.find(s => this._matchSku(s.sku)) ? 'enabled' : 'disabled';

      if (this.state === 'disabled') {
        this.disabledMessage = this._skuNotAvailableMessage;
        this.disabledInfoLink = this._skuNotAvailableLink;
      }
    }
  }

  private async _checkIfSkuEnabledInRegion(subscriptionId: string, location: string, isLinux: boolean): Promise<void> {
    if (this.state !== 'hidden' && this.state !== 'disabled') {
      const locations = await this._getProviderLocations(subscriptionId, 'serverFarms');
      const geoRegionsForSku = await this._getAllGeoRegionsForSku(subscriptionId, this._sku, isLinux);

      const geoRegions = this._getAvailableGeoRegionsList(locations, geoRegionsForSku);
      if (!geoRegions.find(g => g.properties.name.toLowerCase() === location.toLowerCase())) {
        this.state = 'disabled';
        this.disabledMessage = this._skuNotAvailableMessage;
        this.disabledInfoLink = this._skuNotAvailableLink;
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
    let id = `/subscriptions/${subscriptionId}/providers/microsoft.web/georegions`;

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
