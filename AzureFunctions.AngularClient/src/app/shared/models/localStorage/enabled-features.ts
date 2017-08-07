import { OpenBladeInfo } from './../portal';
import { StorageItem } from './local-storage';

// If you change the order of this enum, make sure you update the storage API version.
// Appending new enum values shouldn't require an API change.
export enum Feature {
    DeploymentSource,
    Cors,
    Authentication,
    CustomDomains,
    SSLBinding,
    ApiDefinition,
    WebJobs,
    SiteExtensions,
    AppInsight,
    FunctionSettings,
    AppSettings
}

export interface EnabledFeatures extends StorageItem {
    enabledFeatures: EnabledFeature[];
}

export interface EnabledFeature {
    title: string,
    feature: Feature
}

export interface EnabledFeatureItem extends EnabledFeature {
    featureId?: string;
    bladeInfo?: OpenBladeInfo;
    iconUrl: string;
    focusable: boolean;
}
