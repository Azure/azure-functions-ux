import {Observable} from 'rxjs/Rx';

export interface IPortalService {
    getToken(): Observable<string>;
    openBlade(name: string, source: string) : void;
    openCollectorBlade(name: string, source: string, getAppSettingCallback: (appSettingName: string) => void): void;
    logAction(subcomponent: string, action: string, data?: string): void;
    setDirtyState(dirty : boolean) : void;
}