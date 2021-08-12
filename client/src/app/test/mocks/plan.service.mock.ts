import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IPlanService } from '../../shared/services/plan.service';
import { Result } from '../../shared/conditional-http-client';
import { ArmObj, ResourceId, AvailableSku } from '../../shared/models/arm/arm-obj';
import { ServerFarm } from '../../shared/models/server-farm';
import { BillingMeter } from '../../shared/models/arm/billingMeter';
import { SpecCostQueryInput } from '../../site/spec-picker/price-spec-manager/billing-models';

@Injectable()
export class MockPlanService implements IPlanService {
  planToReturn: ArmObj<ServerFarm> = {
    id: `/subscriptions/mysub/resourcegroups/myrg/providers/microsoft.web/serverfarms/myplan`,
    name: 'myplan',
    type: 'microsoft.web/serverfarms',
    kind: '',
    location: 'West US',
    properties: {},
    sku: {
      name: 'S1',
    },
  };

  getPlan(resourceId: ResourceId, force?: boolean): Result<ArmObj<ServerFarm>> {
    return Observable.of({
      isSuccessful: true,
      error: null,
      result: this.planToReturn,
    });
  }

  updatePlan(plan: ArmObj<ServerFarm>): Result<ArmObj<ServerFarm>> {
    return null;
  }

  getAvailableSkusForPlan(resourceId: ResourceId): Observable<AvailableSku[]> {
    return null;
  }

  getAvailableGeoRegionsForSku(subscriptionId: string, sku: string, isLinux: boolean, isXenonWorkersEnabled: boolean) {
    return null;
  }

  getBillingMeters(subscriptionId: string, location?: string): Observable<ArmObj<BillingMeter>[]> {
    return null;
  }

  getSpecCosts(query: SpecCostQueryInput) {
    return null;
  }
}
