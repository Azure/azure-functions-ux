import {Observable} from 'rxjs/Rx';

export interface IPortalService {
    getToken(): Observable<string>;
    openBlade(name: string) : void;
    openCollectorBlade(name: string, getAppSettingCallback: (appSettingName: string, cancelled: boolean) => void): void;
}