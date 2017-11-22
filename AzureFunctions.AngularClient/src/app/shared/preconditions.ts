import { FunctionAppContext } from './function-app-context';
import { CacheService } from 'app/shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import { ArmObj } from './models/arm/arm-obj';
import { Site } from './models/arm/site';
import { errorIds } from './models/error-ids';
import { HostingEnvironment } from './models/arm/hosting-environment';
import { LogService } from './services/log.service';
import { Headers } from '@angular/http';
import { HostStatus } from './models/host-status';

export namespace Preconditions {
    export type PreconditionErrorId = string;
    export type HttpPreconditions = 'NotStopped' | 'ReachableLoadballancer' | 'NotOverQuota' | 'RuntimeAvailable' | 'NoClientCertificate';
    export type PreconditionMap = {[key in HttpPreconditions]: HttpPrecondition };
    export type DataService = CacheService;

    export interface PreconditionResult {
        conditionMet: boolean;
        errorId: PreconditionErrorId;
    }

    export abstract class HttpPrecondition {
        constructor(protected dataService: DataService, protected logService: LogService) { }
        abstract check(context: FunctionAppContext): Observable<PreconditionResult>;
    }

    export class NotStoppedPrecondition extends HttpPrecondition {
        check(context: FunctionAppContext): Observable<PreconditionResult> {
            return this.dataService.getArm(context.site.id)
                .map(r => {
                    const app: ArmObj<Site> = r.json();
                    return {
                        conditionMet: app.properties.state && app.properties.state.toLocaleLowerCase() === 'running',
                        errorId: errorIds.preconditionsErrors.appIsStopped
                    };
                })
                .catch(() => {
                    // TODO: [ahmels] add logging
                    return Observable.of({
                        conditionMet: false,
                        errorId: errorIds.preconditionsErrors.errorAccessingArm
                    });
                });
        }
    }

    export class ReachableLoadballancerPrecondition extends HttpPrecondition {
        check(context: FunctionAppContext): Observable<PreconditionResult> {
            return this.dataService.getArm(context.site.id)
                .concatMap(r => {
                    const app: ArmObj<Site> = r.json();
                    if (app.properties.hostingEnvironmentProfile &&
                        app.properties.hostingEnvironmentProfile.id) {
                        return this.dataService.getArm(app.properties.hostingEnvironmentProfile.id, false, '2016-09-01')
                            .concatMap(a => {
                                const ase: ArmObj<HostingEnvironment> = a.json();
                                if (ase.properties.internalLoadBalancingMode &&
                                    ase.properties.internalLoadBalancingMode !== 'None') {
                                    return this.dataService.get(context.urlTemplates.runtimeSiteUrl)
                                        .map(() => true)
                                        .catch(() => Observable.of(false));
                                } else {
                                    return Observable.of(true);
                                }
                            });
                    } else {
                        return Observable.of(true);
                    }
                })
                .map(r => {
                    return {
                        conditionMet: r,
                        errorId: errorIds.preconditionsErrors.unreachableInternalLoadBalancer
                    };
                })
                .catch(() => {
                    // TODO: [ahmels] add logging
                    return Observable.of({
                        conditionMet: false,
                        errorId: errorIds.preconditionsErrors.errorAccessingArm
                    });
                });
        }
    }

    export class NotOverQuotaPrecondition extends HttpPrecondition {
        check(context: FunctionAppContext): Observable<PreconditionResult> {
            return Observable.of({
                conditionMet: true,
                errorId: null
            });
        }
    }

    export class NoClientCertificatePrecondition extends HttpPrecondition {
        check(context: FunctionAppContext): Observable<PreconditionResult> {
            return this.dataService.postArm(`${context.site.id}/config/authsettings/list`)
                .map(r => {
                    const auth: ArmObj<any> = r.json();
                    return {
                        easyAuthEnabled: auth.properties['enabled'] && auth.properties['unauthenticatedClientAction'] !== 1,
                        AADConfigured: auth.properties['clientId'] ? true : false,
                        AADNotConfigured: auth.properties['clientId'] ? false : true,
                        clientCertEnabled: context.site.properties.clientCertEnabled
                    };
                })
                .map(auth => {
                    return {
                        conditionMet: !auth.clientCertEnabled,
                        errorId: errorIds.preconditionsErrors.clientCertEnabled
                    };
                })
                .catch(() => {
                    // TODO: [ahmels] add logging
                    return Observable.of({
                        conditionMet: false,
                        errorId: errorIds.preconditionsErrors.errorAccessingArm
                    });
                });
        }
    }

    export class RuntimeAvailablePrecondition extends HttpPrecondition {
        constructor(dataService: DataService, logService: LogService, private getToken: (context: FunctionAppContext) => Observable<string>) {
            super(dataService, logService);
        }
        check(context: FunctionAppContext): Observable<PreconditionResult> {
            return this.getToken(context)
                .take(1)
                .concatMap(token => {
                    const headers = new Headers();
                    headers.append('Authorization', `Bearer ${token}`);
                    return this.dataService.post(context.urlTemplates.runtimeStatusUrl, false, headers);
                })
                .map(r => {
                    const status: HostStatus = r.json();
                    return {
                        conditionMet: status.state === 'running',
                        errorId: errorIds.preconditionsErrors.runtimeIsNotAvailable
                    };
                })
                .catch(() => {
                    // TODO: [ahmels] add logging
                    return Observable.of({
                        conditionMet: false,
                        errorId: errorIds.preconditionsErrors.runtimeHttpNotAvailable
                    });
                });
        }
    }
}
