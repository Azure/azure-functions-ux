import { Injectable } from '@angular/core';

@Injectable()
export class TelemetryService {
    constructor() {
    }

    public featureConstructComplete(featureName: string) {
    }

    public featureLoading(isParentComponent: boolean, featureName: string, componentName: string) {
    }

    public featureLoadingComplete(featureName: string, componentName: string) {
    }
}
