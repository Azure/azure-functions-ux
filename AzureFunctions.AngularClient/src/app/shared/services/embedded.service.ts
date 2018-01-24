import { StartupInfo } from 'app/shared/models/portal';
import { ArmService } from 'app/shared/services/arm.service';
import { errorIds } from 'app/shared/models/error-ids';
import { Entity } from './../../function/embedded/models/entity';
import { ArmArrayResult } from './../models/arm/arm-obj';
import { FunctionAppHttpResult } from './../models/function-app-http-result';
import { Observable } from 'rxjs/Observable';
import { CacheService } from 'app/shared/services/cache.service';
import { Injectable } from '@angular/core';
import { UserService } from 'app/shared/services/user.service';
import { Response } from '@angular/http';

@Injectable()
export class EmbeddedService {
    private _cdsEntitiesUrlFormat = 'https://tip1.api.cds.microsoft.com/providers/Microsoft.CommonDataModel/environments/{0}/namespaces/{1}/entities?api-version=2016-11-01-alpha&$expand=namespace&headeronly=true';

    constructor(
        private _userService: UserService,
        private _cacheService: CacheService,
        private _armService: ArmService) { }

    deleteFunction(resourceId: string): Observable<FunctionAppHttpResult<void>> {
        return this._userService.getStartupInfo()
            .first()
            .switchMap(info => {
                const headers = this._getHeaders(info);
                const url = this._armService.getArmUrl(resourceId, this._armService.websiteApiVersion);
                return this._cacheService.delete(url, headers);
            })
            .map(r => {
                const result: FunctionAppHttpResult<void> = {
                    isSuccessful: true,
                    error: null,
                    result: null
                };
                return result;
            })
            .catch(e => {
                const result: FunctionAppHttpResult<void> = {
                    isSuccessful: false,
                    error: {
                        errorId: errorIds.embeddedEditorDeleteError,
                        message: 'Failed to delete function'
                    },
                    result: null
                };

                return Observable.of(result);
            });
    }

    getEntities(): Observable<FunctionAppHttpResult<ArmArrayResult<Entity>>> {
        return this._userService
            .getStartupInfo()
            .first()
            .switchMap(info => {
                const headers = this._getHeaders(info);
                const url = this._cdsEntitiesUrlFormat.format(info.crmInfo.environmentId, info.crmInfo.namespaceId);
                return this._cacheService.get(url, false, headers);
            })
            .map((r: Response) => {
                const result: FunctionAppHttpResult<ArmArrayResult<Entity>> = {
                    isSuccessful: true,
                    error: null,
                    result: r.json()
                };
                return result;
            })
            .catch(e => {
                const result: FunctionAppHttpResult<ArmArrayResult<Entity>> = {
                    isSuccessful: false,
                    error: {
                        errorId: errorIds.embeddedGetEntities,
                        message: 'Failed to get entitites'
                    },
                    result: null
                };

                return Observable.of(result);
            });
    }

    private _getHeaders(info: StartupInfo){
        const headers = this._armService.getHeaders();
        headers.append('x-cds-crm-user-token', info.crmInfo.crmTokenHeaderName);
        headers.append('x-cds-crm-org', info.crmInfo.crmInstanceHeaderName);
        headers.append('x-cds-crm-solutionid', info.crmInfo.crmSolutionIdHeaderName);
        return headers;
    }
}
