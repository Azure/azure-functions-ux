import { ArmObj } from './../../AzureFunctions.AngularClient/src/app/shared/models/arm/arm-obj';
import { HostingEnvironment } from './../../AzureFunctions.AngularClient/src/app/shared/models/arm/hosting-environment';
import { CacheService } from 'app/shared/services/cache.service';
import { Observable } from '../../AzureFunctions.AngularClient/node_modules/rxjs/Observable';
import { FunctionApp } from './../../AzureFunctions.AngularClient/src/app/shared/function-app';


export function reachableInternalLoadBalancerApp(functionApp: FunctionApp, http: CacheService): Observable<boolean> {
    if (functionApp.site.properties.hostingEnvironmentProfile &&
        functionApp.site.properties.hostingEnvironmentProfile.id) {
        return http.getArm(functionApp.site.properties.hostingEnvironmentProfile.id, false, '2016-09-01')
            .mergeMap(r => {
                const ase: ArmObj<HostingEnvironment> = r.json();
                if (ase.properties.internalLoadBalancingMode &&
                    ase.properties.internalLoadBalancingMode !== 'None') {
                    return functionApp.pingScmSite();
                } else {
                    return Observable.of(true);
                }
            });
    } else {
        return Observable.of(true);
    }
}