import {Observable} from 'rxjs/Rx';
import {User} from '../models/user';
import {TenantInfo} from '../models/tenant-info';

export interface IUserService {
    getTenants(): Observable<TenantInfo[]>;
    getUser(): Observable<User>;
}