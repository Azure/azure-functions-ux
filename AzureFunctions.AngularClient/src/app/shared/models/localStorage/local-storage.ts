import { StorageItem } from './local-storage';

export interface StorageItem {
    id: string;
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
