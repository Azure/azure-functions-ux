import { ArmEmbeddedService } from './arm-embedded.service';
import { FunctionInfo } from 'app/shared/models/function-info';
import { FunctionAppContext } from 'app/shared/function-app-context';
import { StartupInfo } from 'app/shared/models/portal';
import { ArmService } from 'app/shared/services/arm.service';
import { errorIds } from 'app/shared/models/error-ids';
import { Entity } from './../../function/embedded/models/entity';
import { ArmArrayResult } from './../models/arm/arm-obj';
import { HttpResult } from './../models/http-result';
import { Observable } from 'rxjs/Observable';
import { CacheService } from 'app/shared/services/cache.service';
import { Injectable } from '@angular/core';
import { UserService } from 'app/shared/services/user.service';
import { Response } from '@angular/http';

@Injectable()
export class EmbeddedService {
  private _cdsEntitiesUrlFormat =
    'https://tip1.api.cds.microsoft.com/providers/Microsoft.CommonDataModel/environments/{0}/namespaces/{1}/entities?api-version=2016-11-01-alpha&$expand=namespace&headeronly=true';

  constructor(private _userService: UserService, private _cacheService: CacheService, private _armService: ArmService) {}

  createFunction(context: FunctionAppContext, functionName: string, files: any, config: any): Observable<HttpResult<FunctionInfo>> {
    const filesCopy = Object.assign({}, files);
    const sampleData = filesCopy['sample.dat'];
    delete filesCopy['sample.dat'];

    return this._userService
      .getStartupInfo()
      .first()
      .switchMap(info => {
        const headers = this._getHeaders(info);
        const content = JSON.stringify({ files: filesCopy, test_data: sampleData, config: config });
        const url = context.urlTemplates.getFunctionUrl(functionName);
        return this._cacheService.put(url, headers, content).map(r => r.json() as FunctionInfo);
      })
      .do(() => {
        const smallerSiteId = context.site.id
          .split('/')
          .filter(part => !!part)
          .slice(0, 4)
          .join('/');
        const functionsUrl = `${ArmEmbeddedService.url}/${smallerSiteId}/functions`;
        this._cacheService.clearCachePrefix(functionsUrl);
      })
      .map((r: FunctionInfo) => {
        const result: HttpResult<FunctionInfo> = {
          isSuccessful: true,
          error: null,
          result: r,
        };
        return result;
      })
      .catch(e => {
        const result: HttpResult<FunctionInfo> = {
          isSuccessful: false,
          error: {
            errorId: errorIds.embeddedCreateError,
            message: e._body,
          },
          result: null,
        };

        return Observable.of(result);
      });
  }

  deleteFunction(resourceId: string): Observable<HttpResult<void>> {
    return this._userService
      .getStartupInfo()
      .first()
      .switchMap(info => {
        const headers = this._getHeaders(info);
        const url = this._armService.getArmUrl(resourceId, this._armService.antaresApiVersion20181101);
        return this._cacheService.delete(url, headers);
      })
      .map(r => {
        const result: HttpResult<void> = {
          isSuccessful: true,
          error: null,
          result: null,
        };
        return result;
      })
      .catch(e => {
        const result: HttpResult<void> = {
          isSuccessful: false,
          error: {
            errorId: errorIds.embeddedDeleteError,
            message: 'Failed to delete function',
          },
          result: null,
        };

        return Observable.of(result);
      });
  }

  getEntities(): Observable<HttpResult<ArmArrayResult<Entity>>> {
    return this._userService
      .getStartupInfo()
      .first()
      .switchMap(info => {
        const headers = this._getHeaders(info);
        const url = this._cdsEntitiesUrlFormat.format(info.crmInfo.environmentId, info.crmInfo.namespaceId);
        return this._cacheService.get(url, false, headers);
      })
      .map((r: Response) => {
        const result: HttpResult<ArmArrayResult<Entity>> = {
          isSuccessful: true,
          error: null,
          result: r.json(),
        };
        return result;
      })
      .catch(e => {
        const result: HttpResult<ArmArrayResult<Entity>> = {
          isSuccessful: false,
          error: {
            errorId: errorIds.embeddedGetEntities,
            message: 'Failed to get entitites',
          },
          result: null,
        };

        return Observable.of(result);
      });
  }

  private _getHeaders(info: StartupInfo<void>) {
    const headers = this._armService.getHeaders();
    headers.append('x-cds-crm-user-token', info.crmInfo.crmTokenHeaderName);
    headers.append('x-cds-crm-org', info.crmInfo.crmInstanceHeaderName);
    headers.append('x-cds-crm-solutionid', info.crmInfo.crmSolutionIdHeaderName);
    return headers;
  }
}
