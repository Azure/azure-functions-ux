import { Injectable, Injector } from '@angular/core';
import { CacheService } from '../../../shared/services/cache.service';
import { UserService } from '../../../shared/services/user.service';
import { ConditionalHttpClient, Result } from '../../../shared/conditional-http-client';
import { ProxyRequest, GetRepositoryTagRequest } from '../container-settings';
import { Constants } from '../../../shared/models/constants';

@Injectable()
export class ContainerValidationService {
    private readonly _client: ConditionalHttpClient;

    constructor(
        private _cacheService: CacheService,
        private _userService: UserService,
        injector: Injector) {
        this._client = new ConditionalHttpClient(injector, _ => this._userService.getStartupInfo().map(i => i.token));
    }

    public validateContainerImage(resourceId: string, baseUrl: string, platform: string, repository: string, tag: string, username: string, password: string): Result<any> {
        const proxyRequestBody: GetRepositoryTagRequest = {
            baseUrl,
            platform,
            repository,
            tag,
            username,
            password,
        };

        const proxyRequest: ProxyRequest<GetRepositoryTagRequest> = {
            method: 'POST',
            url: `${Constants.webAppsHostName}/api/Websites/GetRepositoryTagAsync`,
            body: proxyRequestBody,
            headers: {},
        };

        const validateImage = this._userService
            .getStartupInfo()
            .first()
            .switchMap(i => {
                proxyRequest.headers['Authorization'] = `Bearer ${i.token}`;
                return this._cacheService
                    .post('/api/validateContainerImage', true, null, proxyRequest)
                    .map(r => r.json());
            });

        return this._client.execute({ resourceId: resourceId }, t => validateImage);
    }
}
