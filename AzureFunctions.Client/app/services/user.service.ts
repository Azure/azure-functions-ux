import {Http, Headers} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';
import {User} from '../models/user';
import {TenantInfo} from '../models/tenant-info';
import {FunctionContainer} from '../models/function-container';

@Injectable()
export class UserService {
    public inIFrame: boolean;

    private functionContainerSubject: ReplaySubject<FunctionContainer>;
    private tokenSubject: ReplaySubject<string>;

    constructor(private _http: Http) {
        this.tokenSubject = new ReplaySubject(1);
        this.inIFrame = window.parent !== window;
        this.functionContainerSubject = new ReplaySubject(1);
    }

    getTenants() {
        return this._http.get('api/tenants')
            .catch(e => Observable.of({ json: () => [] }))
            .map<TenantInfo[]>(r => r.json());
            // .publishReplay(1)
            // .refCount();
    }

    getUser() {
        return this._http.get('api/token')
            .map<User>(r => r.json());
    }

    getToken() {
        return this.tokenSubject;
    }

    setToken(token: string) {
        this.tokenSubject.next(token);
    }

    getFunctionContainer() {
        return this.functionContainerSubject;
    }

    setFunctionContainer(fc: FunctionContainer) {
        this.functionContainerSubject.next(fc);
    }
}