import { FeatureItem } from './feature-item';

export class FeatureGroup {
    title: string;
    features: FeatureItem[];
    _focusFeatureIndex: number;

    constructor(title: string, features: FeatureItem[]) {
        this.title = title.toLocaleUpperCase();
        this.features = features;
        if (this.features.length > 0) {
            this.features[0].focusable = true;
            this._focusFeatureIndex = 0;
        }
    }
}