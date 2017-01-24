import {EnabledFeature} from './enabled-features';

export interface Storage{
    apiVersion : string,
    items : StorageItems;
}

export interface StorageItems{
    [key: string] : StorageItem;
}

export interface StorageItem{
    id : string;
    enabledFeatures : EnabledFeature[]; 
}
