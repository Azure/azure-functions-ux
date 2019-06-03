import { Injectable, Injector } from '@angular/core';
import { CacheService } from '../../../shared/services/cache.service';
import { UserService } from '../../../shared/services/user.service';
import { ConditionalHttpClient, Result } from '../../../shared/conditional-http-client';
import { ArmResourceDescriptor } from 'app/shared/resourceDescriptors';
import { ValidateRequest, ContainerValidationProperties } from 'app/shared/models/arm/validate';

@Injectable()
export class ContainerValidationService {
  private readonly _client: ConditionalHttpClient;

  constructor(private _cacheService: CacheService, private _userService: UserService, injector: Injector) {
    this._client = new ConditionalHttpClient(injector, _ => this._userService.getStartupInfo().map(i => i.token));
  }

  public validateContainerImage(
    resourceId: string,
    location: string,
    baseUrl: string,
    platform: string,
    repository: string,
    tag: string,
    username: string,
    password: string
  ): Result<any> {
    const resourceDescriptor: ArmResourceDescriptor = new ArmResourceDescriptor(resourceId);
    const validateRequest: ValidateRequest<ContainerValidationProperties> = {
      name: resourceDescriptor.resourceName,
      location: location,
      type: 'Microsoft.Web/container',
      properties: {
        containerRegistryBaseUrl: baseUrl,
        containerRegistryUsername: username,
        containerRegistryPassword: password,
        containerImageRespository: `${repository}:${tag}`,
        containerImageTag: '',
        containerImagePlatform: platform,
      },
    };

    const validateImage = this._cacheService.postArm(resourceId, true, null, validateRequest).map(r => r.json());
    return this._client.execute({ resourceId: resourceId }, t => validateImage);
  }
}
