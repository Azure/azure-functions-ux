import { StorageItem } from './local-storage';

export interface StorageItem {
    id: string;
}

export interface ResourceStringsStorageItem extends StorageItem {
    lang: string;
    cache: string;
    resources: { [key: string]: ResourceStrings };
}

export interface ResourceStrings {
    [key: string]: string;
}

export interface StoredSubscriptions extends StorageItem {
    subscriptions: string[];
}

export interface QuickstartSettings extends StorageItem {
    disabled: boolean;
}

export interface TabSettings extends StorageItem {
    dynamicTabIds: (string | null)[];
}
export interface TabMessage<T> extends StorageItem {
    source_id: string;
    dest_id: string | null;
    verb: string;
    data: T;
}

export interface MonitorViewItem extends StorageItem {
    value: string;
}
