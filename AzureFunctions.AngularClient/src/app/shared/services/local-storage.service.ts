import { LocalStorageKeys } from './../models/constants';
import { Injectable } from '@angular/core';
import { StorageItem, StoredSubscriptions } from '../models/localStorage/local-storage';
import { AiService } from 'app/shared/services/ai.service';

@Injectable()
export class LocalStorageService {
    private _apiVersion = '2017-07-01';
    private _apiVersionKey = 'appsvc-api-version';

    constructor(private _aiService: AiService) {
        const apiVersion = localStorage.getItem(this._apiVersionKey);
        if (!apiVersion || apiVersion !== this._apiVersion) {
            this._resetStorage();
        }

        // Ensures that saving tab state should only happen per-session
        localStorage.removeItem(LocalStorageKeys.siteTabs);
    }

    getItem(key: string): StorageItem {
        return JSON.parse(localStorage.getItem(key));
    }

    addtoSavedSubsKey(sub: string) {
        let savedSubs = <StoredSubscriptions>this.getItem(LocalStorageKeys.savedSubsKey);
        if (!savedSubs) {
            savedSubs = <StoredSubscriptions>{
                id: LocalStorageKeys.savedSubsKey,
                subscriptions: []
            };
        }
        savedSubs.subscriptions.push(sub);
        this.setItem(LocalStorageKeys.savedSubsKey, savedSubs);
    }

    setItem(key: string, item: StorageItem) {
        try {
            localStorage.setItem(key, JSON.stringify(item));
        } catch (e) {
            this._aiService.trackEvent(
                '/storage-service/error', {
                    error: `Clearing local storage with ${localStorage.length} items.  ${e}`
                });

            this._resetStorage();

            try {
                localStorage.setItem(key, JSON.stringify(item));
            } catch (e2) {
                this._aiService.trackEvent(
                    '/storage-service/error', {
                        error: `Failed to save to local storage on 2nd attempt. ${e2}`
                    });
            }
        }
    }

    removeItem(key: string) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            this._aiService.trackEvent(
                '/storage-service/error', {
                    error: `Failed to remove from local storage.  ${e}`
                });
        }
    }

    public addEventListener(handler: (StorageEvent) => void, caller: any) {
        try {
            window.addEventListener('storage', handler.bind(caller));
        } catch (e) {
            this._aiService.trackEvent(
                '/storage-service/error', {
                    error: `Failed to add local storage event listener. ${e}`
                }
            )
        }
    }

    private _resetStorage() {
        localStorage.clear();
        localStorage.setItem(this._apiVersionKey, this._apiVersion);
    }
}