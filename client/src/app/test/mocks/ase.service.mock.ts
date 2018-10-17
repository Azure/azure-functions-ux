import { IAseService } from './../../shared/services/ase.service';
import { HostingEnvironment } from './../../shared/models/arm/hosting-environment';
import { ArmObj, ResourceId } from 'app/shared/models/arm/arm-obj';
import { Injectable } from '@angular/core';
import { Result } from '../../shared/conditional-http-client';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class MockAseService implements IAseService {
  aseToReturn: ArmObj<HostingEnvironment> = {
    id: `/subscriptions/mysub/resourcegroups/myrg/providers/microsoft.web/hostingenvironment/myase`,
    name: 'myase',
    type: 'microsoft.web/hostingenvironments',
    kind: '',
    location: 'West US',
    properties: {
      name: 'myase',
      internalLoadBalancingMode: null,
      vnetName: null,
    },
  };

  getAse(resourceId: ResourceId): Result<ArmObj<HostingEnvironment>> {
    return Observable.of({
      isSuccessful: true,
      error: null,
      result: this.aseToReturn,
    });
  }
}
