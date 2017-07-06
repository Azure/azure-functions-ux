import {FeatureItem} from './feature-item';

export class FeatureGroup{
    title : string;
    features : FeatureItem[];

    constructor(title : string, features : FeatureItem[]){
        this.title = title.toLocaleUpperCase();
        this.features = features;
    }
}