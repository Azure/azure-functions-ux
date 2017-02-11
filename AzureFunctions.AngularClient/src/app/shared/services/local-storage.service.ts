import {Injectable, EventEmitter} from '@angular/core';
import {Storage, StorageItems, StorageItem} from '../models/localStorage/local-storage';
import {EnabledFeature, Feature} from '../models/localStorage/enabled-features';

@Injectable()
export class LocalStorageService {
    public apiVersion = "2016-06-01";
    public storageEntryName = "appsvc";
    public maxItems = 250;
    private _storage : Storage;

    constructor(){}

    getItem(resourceId : string){
        this._loadStorage();
        return this._storage.items[resourceId];
    }

    setItem(resourceId : string, item : StorageItem){
        this._loadStorage();
        this._storage.items[resourceId] = item;
    }

    commit(){
        if(this._storage){

            try{
                // A naive way to limit memory usage and stringify/parse performance (although
                // perf looks good even for a few thousand items).  The "correct" way would be to
                // calculate actual memory usage of the stored string, but that would probably be
                // more expensive.  This is fast and should catch almost all scenario's.  For the
                // ones that we miss (like if there's only a few items but a lot of data within each
                // item), the exception handler should take care of the rest.
                if(Object.keys(this._storage.items).length > this.maxItems){
                    this._clearCache();
                }
                else{
                    localStorage.setItem(this.storageEntryName, JSON.stringify(this._storage));
                }
            }
            catch(error){
                console.log(error);

                // If we fail to save the cache for some reason, we blow it away and start
                // fresh.  This would most likely occur if we ran out of space.
                this._clearCache();
            }
        }
    }

    private _clearCache(){
        localStorage.removeItem(this.storageEntryName);
        this._storage = null;
    }

    private _loadStorage(){
        if(!this._storage){
            let storage : Storage = null;

            try{
                let entry = localStorage.getItem(this.storageEntryName);
                if(entry){
                    storage = JSON.parse(entry);
                }
            }
            catch(e) {
                console.log("Failed to read local storage.  Deleting cache");
                localStorage.removeItem(this.storageEntryName);
            }

            if(storage){
                if(storage.apiVersion !== this.apiVersion){
                    console.log("API version has changed.  Deleting cache");
                    localStorage.removeItem(this.storageEntryName);
                    storage = {
                        apiVersion : this.apiVersion,
                        items : {}
                    }
                }
            }
            else{
                storage = {
                    apiVersion : this.apiVersion,
                    items : {}
                }
            }

            this._storage = storage;
        }
    }

    // This isn't being used and doesn't have unit tests yet so commenting out for now
    // addEnabledFeature(resourceId : string, enabledFeature : EnabledFeature){
    //     let item = this.getItem(resourceId);
    //     let newFeature = <EnabledFeature>{
    //         feature : enabledFeature.feature,
    //         title : enabledFeature.title
    //     }

    //     if(item){
    //         if(item.enabledFeatures){
    //             let existingFeature = item.enabledFeatures.find(f => f.feature === enabledFeature.feature);
    //             if(existingFeature){
    //                 existingFeature.title = enabledFeature.title;
    //             }
    //             else{
    //                 item.enabledFeatures.push(newFeature);
    //             }
    //         }
    //         else{
    //             item.enabledFeatures = [newFeature];
    //         }
    //     }
    //     else{
    //         item = <StorageItem>{
    //             id : resourceId,
    //             enabledFeatures : [newFeature]
    //         }

    //         this.setItem(resourceId, item);
    //     }
    // }

    // removeEnabledFeature(resourceId : string, feature : Feature){
    //     let item = this.getItem(resourceId);
    //     if(!item){
    //         item = <StorageItem>{
    //             id : resourceId,
    //             enabledFeatures : []
    //         }

    //         this.setItem(resourceId, item);
    //     }
    //     else{
    //         if(item.enabledFeatures){
    //             let removeIndex = item.enabledFeatures.findIndex(f => f.feature === feature);
    //             if(removeIndex > -1){
    //                 item.enabledFeatures.splice(removeIndex, 1);
    //             }
    //         }
    //         else{
    //             item.enabledFeatures = [];
    //         }
    //     }
    // }
}