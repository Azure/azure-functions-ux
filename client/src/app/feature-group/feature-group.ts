import { FeatureItem } from './feature-item';

export class FeatureGroup {
    title: string;
    features: FeatureItem[];

    constructor(title: string, features: FeatureItem[]) {
        this.title = title;
        this.features = features;
        if (this.features.length > 0) {
            this.features[0].nameFocusable = true;
        }
    }
}