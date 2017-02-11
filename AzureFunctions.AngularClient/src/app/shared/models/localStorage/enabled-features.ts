export enum Feature{
    DeploymentSource,
    WebJobs,
    Backups,
    SiteExtensions,
    Cors
}

export interface EnabledFeature{
    title : string,
    feature : Feature
}

export interface EnabledFeatureItem extends EnabledFeature{
    componentName : string,
    isBlade : boolean
}
