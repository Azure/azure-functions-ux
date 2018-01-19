import { FunctionApp } from './../function-app';
import { Observable } from 'rxjs/Observable';
import { HostingEnvironment } from './../models/arm/hosting-environment';
import { ArmObj } from './../models/arm/arm-obj';
import { CacheService } from 'app/shared/services/cache.service';


export function reachableInternalLoadBalancerApp(functionApp: FunctionApp, http: CacheService): Observable<boolean> {
    if (functionApp && functionApp.site &&
        functionApp.site.properties.hostingEnvironmentProfile &&
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