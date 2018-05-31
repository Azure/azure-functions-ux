import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAuthzService } from '../../shared/services/authz.service';

@Injectable()
export class MockAuthzService implements IAuthzService {

    public returnHasPermission = true;
    public returnHasReadOnlyLock = false;

    constructor() {
    }

    hasPermission(resourceId: string, requestedActions: string[]): Observable<boolean> {
        return Observable.of(this.returnHasPermission);
    }

    hasReadOnlyLock(resourceId: string): Observable<boolean> {
        return Observable.of(this.returnHasReadOnlyLock);
    }
}
