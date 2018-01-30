import { Preconditions as p } from './preconditions';
import { AuthzService } from 'app/shared/services/authz.service';
import { Observable } from 'rxjs/Observable';
import { errorIds } from '../models/error-ids';
import { Injector } from '@angular/core';

export namespace Preconditions{
    export class HasPermissionsPrecondition extends p.HttpPrecondition {
        private _authzService: AuthzService;

        constructor(injector: Injector){
            super(injector);
            this._authzService = injector.get(AuthzService);
        }
    
        check(input: p.PreconditionInput) {
            if (!input.permissionsToCheck) {
                return Observable.of({
                    conditionMet: false,
                    errorId: errorIds.preconditionsErrors.noPermissionToCheck
                });
            }
    
            return this._authzService.hasPermission(input.resourceId, input.permissionsToCheck)
                .map(hasPermission => {
                    return {
                        conditionMet: hasPermission,
                        errorId: errorIds.preconditionsErrors.noPermission
                    };
                });
        }
    }

    export class NoReadonlyLockPrecondition extends p.HttpPrecondition {
        private _authzService: AuthzService;

        constructor(injector: Injector){
            super(injector);
            this._authzService = injector.get(AuthzService);
        }
    
        check(input: p.PreconditionInput) {
    
            return this._authzService.hasReadOnlyLock(input.resourceId)
                .map(hasLock => {
    
                    return {
                        conditionMet: !hasLock,
                        errorId: errorIds.preconditionsErrors.hasReadonlyLock
                    };
                });
        }
    }

}
