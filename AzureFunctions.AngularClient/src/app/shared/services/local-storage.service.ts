import { LocalStorageKeys } from './../models/constants';
import { PortalService } from './portal.service';
import {LogEntryLevel} from '../models/portal';
import {Injectable, EventEmitter} from '@angular/core';
import {StorageItem} from '../models/localStorage/local-storage';
import {EnabledFeature, Feature} from '../models/localStorage/enabled-features';

@Injectable()
export class LocalStorageService {
    private _apiVersion = "2017-02-01";
    private _apiVersionKey = "appsvc-api-version";

    constructor(private _portalService : PortalService){
        let apiVersion = localStorage.getItem(this._apiVersionKey);
        if(!apiVersion || apiVersion !== this._apiVersion){
            this._resetStorage();
        }

        // Ensures that saving tab state should only happen per-session
        localStorage.removeItem(LocalStorageKeys.siteTabs);
    }

    getItem(key : string) : StorageItem{
        return JSON.parse(localStorage.getItem(key));
    }

    setItem(key : string, item : StorageItem){
        try{
            localStorage.setItem(key, JSON.stringify(item));
        }
        catch(e){
            this._portalService.logMessage(LogEntryLevel.Debug, `Clearing local storage with ${localStorage.length} items.  ${e}`);

            this._resetStorage();

            try{
                localStorage.setItem(key, JSON.stringify(item));
            }
            catch(e2){
                this._portalService.logMessage(LogEntryLevel.Error, "Failed to save to local storage on 2nd attempt. ${e2}");
            }
        }
    }

    removeItem(key : string){
        localStorage.removeItem(key);
    }

    private _resetStorage(){
        localStorage.clear();
        localStorage.setItem(this._apiVersionKey, this._apiVersion);            
    }
}