import { LogCategories, ARMApiVersions } from 'app/shared/models/constants';
import { LogService } from 'app/shared/services/log.service';
import { BillingMeter } from './../models/arm/billingMeter';
import { ArmService } from 'app/shared/services/arm.service';
import { ArmProviderInfo } from './../models/arm/ArmProviderInfo';
import { ServerFarm } from './../models/server-farm';
import { ResourceId, ArmObj, AvailableSku, ArmArrayResult } from 'app/shared/models/arm/arm-obj';
import { Observable } from 'rxjs/Observable';
import { Injectable, Injector } from '@angular/core';
import { ConditionalHttpClient, Result } from '../conditional-http-client';
import { UserService } from './user.service';
import { CacheService } from './cache.service';
import { GeoRegion } from '../models/arm/georegion';
import { Subject } from 'rxjs/Subject';
import { SpecCostQueryInput } from '../../site/spec-picker/price-spec-manager/billing-models';
import { OsType } from '../models/arm/stacks';
import { Site } from './../models/arm/site';

export interface IPlanService {
  getPlan(resourceId: ResourceId, force?: boolean): Result<ArmObj<ServerFarm>>;
  updatePlan(plan: ArmObj<ServerFarm>);
  getAvailableSkusForPlan(resourceId: ResourceId): Observable<AvailableSku[]>;
  getAvailableGeoRegionsForSku(subscriptionId: string, sku: string, isLinux: boolean);
  getBillingMeters(subscriptionId: string, osType: OsType, location?: string): Observable<ArmObj<BillingMeter>[]>;
}

@Injectable()
export class PlanService implements IPlanService {
  private readonly _client: ConditionalHttpClient;

  constructor(
    userService: UserService,
    injector: Injector,
    private _cacheService: CacheService,
    private _armService: ArmService,
    private _logService: LogService
  ) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  getPlan(resourceId: ResourceId, force?: boolean): Result<ArmObj<ServerFarm>> {
    const getPlan = this._cacheService.getArm(resourceId, force).map(r => r.json());
    return this._client.execute({ resourceId: resourceId }, t => getPlan);
  }

  updatePlan(plan: ArmObj<ServerFarm>) {
    const updatePlan = this._cacheService.putArm(plan.id, null, plan);
    return this._client
      .execute({ resourceId: plan.id }, t => updatePlan)
      .switchMap(r => {
        if (r.isSuccessful) {
          const location = r.result.headers.get('Location');
          const stopPolling$ = new Subject();

          if (location) {
            return Observable.timer(0, 2000)
              .takeUntil(stopPolling$)
              .switchMap(t => {
                const getUpdateResult = this._cacheService.get(location, true);
                return this._client.execute({ resourceId: plan.id }, g => getUpdateResult);
              })
              .filter(p => {
                if (!p.isSuccessful) {
                  this._logService.error(LogCategories.serverFarm, '/update', `Failed to update plan '${plan.id}' - ${p.error.message} `);
                }

                // Only allow completed states to continue (ie anything but a 202 status code).
                // Also we're counting a 201 status code as "completed", which occurs when you
                // update an isolated plan on an ASE.  The reason why we're letting that one
                // go is because scaling an isolated plan takes a super long time.  So instead
                // we'll let the caller figure out how they want to handle that situation.
                return p.isSuccessful ? p.result.status !== 202 : true;
              })
              .do(p => {
                stopPolling$.next();
              });
          }

          // Updates to ASP's on an ASE don't return a location headrer, but that doesn't mean they're
          // complete.  Since these updates can take a really long time, we're going to return success
          // for now and let the caller figure out how to handle the long running operation using
          // the provisioningState property
          return Observable.of(r);
        } else {
          return Observable.of(r);
        }
      });
  }

  getAvailableSkusForPlan(resourceId: ResourceId): Observable<AvailableSku[]> {
    const getSkus = this._cacheService.getArm(resourceId + '/skus');
    return this._client.execute({ resourceId: resourceId }, t => getSkus).map(r => r.result.json().value);
  }

  getAvailableGeoRegionsForSku(subscriptionId: string, sku: string, isLinux: boolean) {
    return Observable.zip(
      this._getProviderLocations(subscriptionId, 'serverFarms'),
      this._getAllGeoRegionsForSku(subscriptionId, sku, isLinux)
    ).map(r => {
      return this._getAvailableGeoRegionsList(r[1], r[0]);
    });
  }

  getBillingMeters(subscriptionId: string, osType: OsType, location?: string): Observable<ArmObj<BillingMeter>[]> {
    let url = `${this._armService.armUrl}/subscriptions/${subscriptionId}/providers/Microsoft.Web/billingMeters?api-version=${
      this._armService.antaresApiVersion20181101
    }`;
    if (location) {
      url += `&billingLocation=${location.replace(/\s/g, '')}`;
    }

    if (osType) {
      url += `&osType=${osType}`;
    }

    const getMeters = this._cacheService.get(url);
    return this._client
      .execute({ resourceId: url }, t => getMeters)
      .map(r => {
        return r.result.json().value;
      });
  }

  getSpecCosts(query: SpecCostQueryInput) {
    const url = `https://s2.billing.ext.azure.com/api/Billing/Subscription/GetSpecsCosts`;

    const getSpecCosts = this._cacheService.post(url, false, null, query);
    return this._client
      .execute({ resourceId: url }, t => getSpecCosts)
      .map(r => {
        return r.result.json();
      });
  }

  getServerFarmSites(resourceId: ResourceId, includeSlots = false, force = false): Result<ArmArrayResult<Site>> {
    const uri = !includeSlots ? `${resourceId}/sites` : `${resourceId}/sites?includeSlots=true`;
    const getServerFarmSites = this._cacheService
      .getArm(uri, force)
      .expand(response => {
        const nextLink = response.json().nextLink;
        if (nextLink) {
          return this._cacheService.get(nextLink, force);
        } else {
          return Observable.empty();
        }
      })
      .map(r => r.json());
    return this._client.execute({ resourceId: resourceId }, t => getServerFarmSites);
  }

  private _getProviderLocations(subscriptionId: string, resourceType: string): Observable<string[]> {
    const getProviderInfo = this._cacheService.getArm(
      `/subscriptions/${subscriptionId}/providers/microsoft.web`,
      false,
      ARMApiVersions.antaresApiVersion20181101
    );

    return this._client
      .execute({ resourceId: '' }, t => getProviderInfo)
      .map(info => {
        const provider: ArmProviderInfo = info.result.json();
        return provider.resourceTypes.find(t => t.resourceType.toLowerCase() === resourceType.toLowerCase()).locations;
      });
  }

  private _getAllGeoRegionsForSku(subscriptionId: string, sku: string, isLinux: boolean): Observable<ArmObj<GeoRegion>[]> {
    let id = `/subscriptions/${subscriptionId}/providers/microsoft.web/georegions?sku=${sku}`;
    if (isLinux) {
      id += '&linuxWorkersEnabled=true';
    }

    const getRegionsForSku = this._cacheService.getArm(id);

    return this._client
      .execute({ resourceId: '' }, t => getRegionsForSku)
      .map(r => {
        return r.result.json().value;
      });
  }

  private _getAvailableGeoRegionsList(geoRegions: ArmObj<GeoRegion>[], providerLocations: string[]) {
    const normalizeGeoRegions = geoRegions.map(geoRegion => geoRegion.properties.displayName.toLowerCase().replace(' ', ''));
    const normalizeProviderLocations = providerLocations.map(providerLocation => providerLocation.toLowerCase().replace(' ', ''));
    const itemsToRemove: ArmObj<GeoRegion>[] = [];

    for (let i = 0; i < geoRegions.length; i++) {
      if (normalizeProviderLocations.indexOf(normalizeGeoRegions[i]) === -1) {
        itemsToRemove.push(geoRegions[i]);
      }
    }

    return geoRegions.filter(geoRegion => itemsToRemove.indexOf(geoRegion) === -1);
  }
}
