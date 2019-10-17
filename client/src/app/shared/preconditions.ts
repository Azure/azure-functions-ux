import { ARMApiVersions } from 'app/shared/models/constants';
import { CacheService } from 'app/shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import { ArmObj } from './models/arm/arm-obj';
import { Site } from './models/arm/site';
import { errorIds } from './models/error-ids';
import { HostingEnvironment, InternalLoadBalancingMode } from './models/arm/hosting-environment';
import { LogService } from './services/log.service';
import { Headers } from '@angular/http';
import { HostStatus } from './models/host-status';
import { Injector } from '@angular/core';
import { FunctionAppContext } from 'app/shared/function-app-context';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';

export namespace Preconditions {
  export type PreconditionErrorId = string;
  export type HttpPreconditions = 'NotStopped' | 'ReachableLoadballancer' | 'NotOverQuota' | 'RuntimeAvailable' | 'NoClientCertificate';

  export type PreconditionMap = { [key in HttpPreconditions]: HttpPrecondition };

  export interface PreconditionInput {
    resourceId: string;
  }

  export interface PreconditionResult {
    conditionMet: boolean;
    errorId: PreconditionErrorId;
  }

  export abstract class HttpPrecondition {
    protected cacheService: CacheService;
    protected logService: LogService;

    constructor(protected injector: Injector) {
      this.cacheService = injector.get(CacheService);
      this.logService = injector.get(LogService);
    }

    abstract check(input: PreconditionInput): Observable<PreconditionResult>;

    // Can't reference the FunctionAppService here since that service creates these preconditions
    // and would create a stack overflow.
    protected getFunctionAppContext(resourceId: string) {
      return this.cacheService.getArm(resourceId).map(r => ArmUtil.mapArmSiteToContext(r.json(), this.injector));
    }
  }

  export class NotStoppedPrecondition extends HttpPrecondition {
    check(input: PreconditionInput): Observable<PreconditionResult> {
      return this.cacheService
        .getArm(input.resourceId)
        .map(r => {
          const app: ArmObj<Site> = r.json();
          return {
            conditionMet: app.properties.state && app.properties.state.toLocaleLowerCase() === 'running',
            errorId: errorIds.preconditionsErrors.appIsStopped,
          };
        })
        .catch(() => {
          // TODO: [ahmels] add logging
          return Observable.of({
            conditionMet: false,
            errorId: errorIds.preconditionsErrors.errorAccessingArm,
          });
        });
    }
  }

  export class ReachableLoadballancerPrecondition extends HttpPrecondition {
    check(input: PreconditionInput): Observable<PreconditionResult> {
      return this.getFunctionAppContext(input.resourceId)
        .concatMap(context => {
          const app: ArmObj<Site> = context.site;
          if (app.properties.hostingEnvironmentProfile && app.properties.hostingEnvironmentProfile.id) {
            return this.cacheService
              .getArm(app.properties.hostingEnvironmentProfile.id, false, ARMApiVersions.antaresApiVersion20181101)
              .concatMap(a => {
                const ase: ArmObj<HostingEnvironment> = a.json();
                if (
                  ase.properties.internalLoadBalancingMode &&
                  ase.properties.internalLoadBalancingMode !== InternalLoadBalancingMode.None
                ) {
                  return this.cacheService
                    .get(context.urlTemplates.runtimeSiteUrl)
                    .map(() => true)
                    .catch(res => {
                      if (res.status === 0) {
                        return Observable.of(false);
                      }
                      return Observable.of(true);
                    });
                } else {
                  return Observable.of(true);
                }
              })
              .catch(() => {
                return Observable.of(true);
              });
          } else {
            return Observable.of(true);
          }
        })
        .map(r => {
          return {
            conditionMet: r,
            errorId: errorIds.preconditionsErrors.unreachableInternalLoadBalancer,
          };
        })
        .catch(() => {
          // TODO: [ahmels] add logging
          return Observable.of({
            conditionMet: false,
            errorId: errorIds.preconditionsErrors.errorAccessingArm,
          });
        });
    }
  }

  export class NotOverQuotaPrecondition extends HttpPrecondition {
    check(input: PreconditionInput): Observable<PreconditionResult> {
      return Observable.of({
        conditionMet: true,
        errorId: null,
      });
    }
  }

  export class NoClientCertificatePrecondition extends HttpPrecondition {
    check(input: PreconditionInput): Observable<PreconditionResult> {
      return Observable.zip(
        this.cacheService.getArm(input.resourceId),
        this.cacheService.postArm(`${input.resourceId}/config/authsettings/list`)
      )
        .map(tuple => {
          const site: ArmObj<Site> = tuple[0].json();
          const auth: ArmObj<any> = tuple[1].json();
          return {
            easyAuthEnabled: auth.properties['enabled'] && auth.properties['unauthenticatedClientAction'] !== 1,
            AADConfigured: auth.properties['clientId'] ? true : false,
            AADNotConfigured: auth.properties['clientId'] ? false : true,
            clientCertEnabled: site.properties.clientCertEnabled,
          };
        })
        .map(auth => {
          return {
            conditionMet: !auth.clientCertEnabled,
            errorId: errorIds.preconditionsErrors.clientCertEnabled,
          };
        })
        .catch(() => {
          // TODO: [ahmels] add logging
          return Observable.of({
            conditionMet: false,
            errorId: errorIds.preconditionsErrors.errorAccessingArm,
          });
        });
    }
  }

  export class RuntimeAvailablePrecondition extends HttpPrecondition {
    constructor(injector: Injector, private getToken: (resourceId: string) => Observable<string>) {
      super(injector);
    }

    check(input: PreconditionInput): Observable<PreconditionResult> {
      let context: FunctionAppContext;
      return this.getFunctionAppContext(input.resourceId)
        .concatMap(c => {
          context = c;
          return this.getToken(input.resourceId).take(1);
        })
        .concatMap(token => {
          const headers = new Headers();
          headers.append('Authorization', `Bearer ${token}`);
          return this.cacheService.post(context.urlTemplates.runtimeStatusUrl, false, headers);
        })
        .map(r => {
          const status: HostStatus = r.json();
          return {
            conditionMet: status.state !== 'Error',
            errorId: errorIds.preconditionsErrors.runtimeIsNotAvailable,
          };
        })
        .catch(() => {
          // TODO: [ahmels] add logging
          return Observable.of({
            conditionMet: false,
            errorId: errorIds.preconditionsErrors.runtimeHttpNotAvailable,
          });
        });
    }
  }
}
