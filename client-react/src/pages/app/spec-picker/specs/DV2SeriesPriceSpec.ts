import { AvailableSku, ArmObj, GeoRegion, Sku, ServerFarm, ArmArray } from '../../../../models/WebAppModels';
import { PriceSpec, PriceSpecInput, PlanSpecPickerData } from './PriceSpec';
import { store } from '../../../../store';
import { ArmProviderInfo } from '../../../../models/HttpResult';
import MakeArmCall from '../../../../modules/ArmHelper';
export abstract class DV2SeriesPriceSpec extends PriceSpec {
  private readonly _sku: string;
  private readonly _skuNotAvailableMessage: string;
  private readonly _skuNotAvailableLink: string;
  private readonly _armEndpoint: string;
  private readonly _armToken: string;

  constructor(t: (string) => string, sku: string, skuNotAvailableMessage: string, skuNotAvailableLink: string) {
    super(t);
    this._sku = sku;
    this._skuNotAvailableMessage = skuNotAvailableMessage;
    this._skuNotAvailableLink = skuNotAvailableLink;
    this._armEndpoint = store.getState().portalService.startupInfo!.armEndpoint;
    this._armToken = store.getState().portalService.startupInfo!.token;
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

  protected abstract _matchSku(sku: Sku): boolean;
  protected abstract _shouldHideForNewPlan(data: PlanSpecPickerData): boolean;
  protected abstract _shouldHideForExistingPlan(plan: ArmObj<ServerFarm>): boolean;

  private async _checkIfSkuEnabledOnStamp(resourceId: string): Promise<void> {
    if (this.state !== 'hidden') {
      const availableSkuFetch = await MakeArmCall<{ value: AvailableSku[] }>(
        this._armEndpoint,
        this._armToken,
        resourceId,
        '_checkIfSkuEnabledOnStamp'
      );

      const result = availableSkuFetch;
      this.state = result.value.find(s => this._matchSku(s.sku)) ? 'enabled' : 'disabled';

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
    const resourceId = `/subscriptions/${subscriptionId}/providers/microsoft.web?api-version=2018-01-01`;
    const providerLocationsFetch = await MakeArmCall<{ value: ArmProviderInfo }>(
      this._armEndpoint,
      this._armToken,
      resourceId,
      '_getProviderLocations'
    );

    const result = providerLocationsFetch;
    const resource =
      result &&
      result.value &&
      result.value.resourceTypes &&
      result.value.resourceTypes.find(t => t.resourceType.toLowerCase() === resourceType.toLowerCase());

    return !!resource ? resource.locations : [];
  }

  private async _getAllGeoRegionsForSku(subscriptionId: string, sku: string, isLinux: boolean): Promise<ArmObj<GeoRegion>[]> {
    let id = `/subscriptions/${subscriptionId}/providers/microsoft.web/georegions?sku=${sku}`;
    if (isLinux) {
      id += '&linuxWorkersEnabled=true';
    }

    const geoRegionsFetch = await MakeArmCall<ArmArray<GeoRegion>>(this._armEndpoint, this._armToken, id, '_getProviderLocations');

    return geoRegionsFetch.value;
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
