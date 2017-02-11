import {EnabledFeature} from './enabled-features';

export interface StorageItem{
    id : string;
}

export interface StoredSubscriptions extends StorageItem{
    subscriptions : string[];
}