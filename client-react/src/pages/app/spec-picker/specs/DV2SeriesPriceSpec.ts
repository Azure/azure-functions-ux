import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AvailableSku, ArmObj, GeoRegion, Sku, ServerFarm } from '../../../../models/WebAppModels';
import { PriceSpec, PriceSpecInput, PlanSpecPickerData } from './PriceSpec';
import { store } from '../../../../store';
import axios from 'axios';
import { ArmProviderInfo } from 'src/models/HttpResult';

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

  public runInitialization(input: PriceSpecInput) {
    if (input.plan) {
      this.state = this._shouldHideForExistingPlan(input.plan) ? 'hidden' : this.state;

      this._checkIfSkuEnabledOnStamp(input.plan.id).then(() => {
        return this.checkIfDreamspark(input.subscriptionId);
      });
    }

    if (input.specPickerInput.data) {
      this.state = this._shouldHideForNewPlan(input.specPickerInput.data) ? 'hidden' : this.state;

      return this.checkIfDreamspark(input.subscriptionId).pipe(
        tap(_ => {
          return this._checkIfSkuEnabledInRegion(
            input.subscriptionId,
            input.specPickerInput.data ? input.specPickerInput.data.location : '',
            input.specPickerInput.data ? input.specPickerInput.data.isLinux : false
          );
        })
      );
    }

    return of(null);
  }

  protected abstract _matchSku(sku: Sku): boolean;
  protected abstract _shouldHideForNewPlan(data: PlanSpecPickerData): boolean;
  protected abstract _shouldHideForExistingPlan(plan: ArmObj<ServerFarm>): boolean;

  private _checkIfSkuEnabledOnStamp(resourceId: string): Promise<void> {
    if (this.state !== 'hidden') {
      return axios
        .get<{ value: AvailableSku[] }>(`${this._armEndpoint}${resourceId}`, {
          headers: {
            Authorization: `Bearer ${this._armToken}`,
          },
        })
        .then(result => {
          this.state = result.data.value.find(s => this._matchSku(s.sku)) ? 'enabled' : 'disabled';

          if (this.state === 'disabled') {
            this.disabledMessage = this._skuNotAvailableMessage;
            this.disabledInfoLink = this._skuNotAvailableLink;
          }
        });
    }

    return Promise.resolve();
  }

  private _checkIfSkuEnabledInRegion(subscriptionId: string, location: string, isLinux: boolean) {
    if (this.state !== 'hidden' && this.state !== 'disabled') {
      return this._getProviderLocations(subscriptionId, 'serverFarms').then(locations => {
        return this._getAllGeoRegionsForSku(subscriptionId, this._sku, isLinux).then(geoRegionsForSku => {
          const geoRegions = this._getAvailableGeoRegionsList(locations, geoRegionsForSku);
          if (!geoRegions.find(g => g.properties.name.toLowerCase() === location.toLowerCase())) {
            this.state = 'disabled';
            this.disabledMessage = this._skuNotAvailableMessage;
            this.disabledInfoLink = this._skuNotAvailableLink;
          }
        });
      });
    }

    return of(null);
  }

  private _getProviderLocations(subscriptionId: string, resourceType: string): Promise<string[]> {
    const resourceId = `/subscriptions/${subscriptionId}/providers/microsoft.web?api-version=2018-01-01`;
    return axios
      .get<{ value: ArmProviderInfo }>(`${this._armEndpoint}${resourceId}`, {
        headers: {
          Authorization: `Bearer ${this._armToken}`,
        },
      })
      .then(result => {
        const resource =
          result.data &&
          result.data.value &&
          result.data.value.resourceTypes &&
          result.data.value.resourceTypes.find(t => t.resourceType.toLowerCase() === resourceType.toLowerCase());

        return !!resource ? resource.locations : [];
      });
  }

  private _getAllGeoRegionsForSku(subscriptionId: string, sku: string, isLinux: boolean): Promise<ArmObj<GeoRegion>[]> {
    let id = `/subscriptions/${subscriptionId}/providers/microsoft.web/georegions?sku=${sku}`;
    if (isLinux) {
      id += '&linuxWorkersEnabled=true';
    }

    return axios
      .get<{ value: ArmObj<GeoRegion>[] }>(`${this._armEndpoint}${id}`, {
        headers: {
          Authorization: `Bearer ${this._armToken}`,
        },
      })
      .then(result => {
        return result.data.value;
      });
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
