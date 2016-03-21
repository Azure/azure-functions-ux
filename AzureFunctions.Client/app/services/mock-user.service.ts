import {Http, Headers} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Rx';
import {User} from '../models/user';
import {TenantInfo} from '../models/tenant-info';
import {IUserService} from './iuser.service';

@Injectable()
export class MockUserService implements IUserService {
    constructor(private _http: Http) { }

    getTenants() {
        return this._http.get('mocks/tenants.json')
            .map<TenantInfo[]>(r => r.json());
    }

    getUser() {
        return this._http.get('mocks/user.json')
            .map<User>(r => r.json());
    }

    getCurrentToken() {
        return 'token';
    }

    getToken() {
        return Observable.of('token');
    }
}