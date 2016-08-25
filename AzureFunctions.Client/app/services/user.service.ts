import {Http, Headers} from '@angular/http';
import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';
import {User} from '../models/user';
import {TenantInfo} from '../models/tenant-info';
import {FunctionContainer} from '../models/function-container';

@Injectable()
export class UserService {
    public inIFrame: boolean;
    private functionContainerSubject: ReplaySubject<FunctionContainer>;
    private tokenSubject: ReplaySubject<string>;
    private languageSubject: ReplaySubject<string>;

    constructor(private _http: Http) {
        this.tokenSubject = new ReplaySubject<string>(1);
        this.languageSubject = new ReplaySubject<string>(1);
        this.inIFrame = window.parent !== window;
        this.functionContainerSubject = new ReplaySubject<FunctionContainer>(1);
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

    setLanguage(lang: string) {
        this.languageSubject.next(lang);
    }

    getLanguage(){
        return this.languageSubject;
    }

    getFunctionContainer() {
        return this.functionContainerSubject;
    }

    setFunctionContainer(fc: FunctionContainer) {
        this.functionContainerSubject.next(fc);
    }
}