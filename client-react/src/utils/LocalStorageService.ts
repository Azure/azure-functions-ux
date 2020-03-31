import { StorageKeys, StorageItem } from '../models/LocalStorage.model';
import { KeyValue } from '../models/portal-models';
import { getDateAfterXSeconds } from './DateUtilities';
import LogService from './LogService';
import { LogCategories } from './LogCategories';

export class LocalStorageService {
  public static supportsLocalStorage(): boolean {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }

  public static getItem(resourceId: string, key: StorageKeys): KeyValue<any> | null {
    const item = LocalStorageService._getItem(resourceId);
    if (item && item.data && item.data[key]) {
      return { value: item.data[key], expired: item.expired };
    }
    return null;
  }

  public static setItem(resourceId: string, key: StorageKeys, value: any, expireSeconds?: number) {
    if (LocalStorageService.supportsLocalStorage()) {
      try {
        const newExpireDate = getDateAfterXSeconds(!!expireSeconds ? expireSeconds : 60);
        const item = LocalStorageService.getItem(resourceId, key);
        let newItem;
        let data = {};
        if (item && item.data) {
          // If the cache item already exists, make sure to copy existing data
          newItem = LocalStorageService._getItem(resourceId);
          data = { ...newItem.data };
        }
        // Overwrite the existing key-value pair if it exists or create a new one
        data[key] = value;
        newItem = {
          data,
          expireDate: newExpireDate,
        };
        localStorage.setItem(resourceId, JSON.stringify(newItem));
      } catch (e) {
        // Most likely we've run out of local storage space so we clear
        // TODO (krmitta): Log error for JSON.stringify
        localStorage.clear();
        return;
      }
    }
  }

  public static removeItem(resourceId: string) {
    if (LocalStorageService.supportsLocalStorage()) {
      try {
        localStorage.removeItem(resourceId);
      } catch (e) {
        LogService.error(
          LogCategories.localStorage,
          'removeCachedItem',
          `Was not able to clear the expired resourceId from the cache: '${resourceId}'`
        );
      }
    }
  }

  private static _getItem(resourceId: string): StorageItem | null {
    if (LocalStorageService.supportsLocalStorage()) {
      try {
        const item = localStorage.getItem(resourceId);
        if (item) {
          const parsedItem = JSON.parse(item) as StorageItem;
          parsedItem.expired = true;
          if (parsedItem.data) {
            if (parsedItem.expireDate && new Date(parsedItem.expireDate) >= new Date()) {
              parsedItem.expired = false;
            }
            return parsedItem;
          }
        }
      } catch (e) {
        // TODO (krmitta): Log error when getItem or JSON.parse fails
      }
    }
    return null;
  }
}
