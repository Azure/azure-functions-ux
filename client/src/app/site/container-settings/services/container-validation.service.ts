import { Injectable } from '@angular/core';
import { CacheService } from '../../../shared/services/cache.service';
import { ArmResourceDescriptor } from 'app/shared/resourceDescriptors';
import { ValidateRequest, ContainerValidationProperties } from 'app/shared/models/arm/validate';
import { ARMApiVersions } from 'app/shared/models/constants';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';

@Injectable()
export class ContainerValidationService {
  constructor(private _cacheService: CacheService) {}

  public validateContainerImage(
    resourceId: string,
    location: string,
    baseUrl: string,
    platform: string,
    repository: string,
    tag: string,
    username: string,
    password: string
  ): Observable<Response> {
    const resourceDescriptor: ArmResourceDescriptor = new ArmResourceDescriptor(resourceId);
    const validateRequest: ValidateRequest<ContainerValidationProperties> = {
      name: resourceDescriptor.resourceName,
      location: location,
      type: 'Microsoft.Web/container',
      properties: {
        containerRegistryBaseUrl: baseUrl,
        containerRegistryUsername: username ? username : '',
        containerRegistryPassword: password ? password : '',
        containerImageRepository: `${repository}:${tag ? tag : 'latest'}`,
        containerImageTag: '',
        containerImagePlatform: platform,
      },
    };

    const validateResourceId = `/subscriptions/${resourceDescriptor.subscription}/resourcegroups/${
      resourceDescriptor.resourceGroup
    }/providers/Microsoft.Web/validate`;

    return this._cacheService.postArm(validateResourceId, true, ARMApiVersions.antaresApiVersion20181101, validateRequest);
  }
}
