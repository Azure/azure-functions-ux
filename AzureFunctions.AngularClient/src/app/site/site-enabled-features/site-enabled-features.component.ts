import { AiService } from './../../shared/services/ai.service';
import { SiteDescriptor } from './../../shared/resourceDescriptors';
import { AuthzService } from './../../shared/services/authz.service';
import { LocalStorageService } from './../../shared/services/local-storage.service';
import { AuthSettings } from './../../shared/models/arm/auth-settings';
import { PortalService } from './../../shared/services/portal.service';
import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {Observable, Subject, Subscription as RxSubscription} from 'rxjs/Rx';
import {CacheService} from '../../shared/services/cache.service';
import {LocalStorageService as StorageService} from '../../shared/services/local-storage.service';
import {Site} from '../../shared/models/arm/site';
import {SiteConfig} from '../../shared/models/arm/site-config';
import {ArmObj} from '../../shared/models/arm/arm-obj';
import {StorageItem} from '../../shared/models/localStorage/local-storage';
import {Feature, EnabledFeatures, EnabledFeature, EnabledFeatureItem} from '../../shared/models/localStorage/enabled-features';

interface EnabledFeatureMap{
    [key : number] : EnabledFeatureItem;
}

@Component({
    selector: 'site-enabled-features',
    templateUrl: './site-enabled-features.component.html',
    styleUrls: ['./site-enabled-features.component.scss'],
    inputs: ['siteInput'],
    outputs: ['componentName']
})

// First load list of enabled features from localStorage
// Then it continues to pull from the back-end to refresh the UI
// and update what's cached in localStorage
export class SiteEnabledFeaturesComponent {

    public featureItems : EnabledFeatureItem[] = [];
    public isLoading : boolean;
    public componentName = new Subject<string>();

    private _site : ArmObj<Site>;
    private _siteSubject = new Subject<ArmObj<Site>>();
    private _descriptor : SiteDescriptor;

    constructor(
        private _cacheService : CacheService,
        private _storageService : StorageService,
        private _portalService : PortalService,
        private _authZService : AuthzService,
        private _aiService : AiService) {

        this._siteSubject
            .distinctUntilChanged()
            .switchMap(site =>{
                this._site = site;
                this.featureItems = [];
                this.isLoading = true;

                this._descriptor = new SiteDescriptor(site.id);

                return Observable.zip(
                    this._authZService.hasPermission(site.id, [AuthzService.writeScope]),
                    this._authZService.hasReadOnlyLock(site.id),
                    (w, l) =>({ hasSiteWritePermissions : w, hasReadOnlyLock : l})
                )
                .map(r => { 
                    return {
                        site : site,
                        hasSiteWritePermissions : r.hasSiteWritePermissions,
                        hasReadOnlyLock : r.hasReadOnlyLock
                    }})
            })
            .switchMap(r =>{

                let storageItem = <EnabledFeatures>this._storageService.getItem(r.site.id + "/enabledFeatures");
                if(storageItem && storageItem.enabledFeatures && storageItem.enabledFeatures.length > 0){

                    // Even though we continue loading in the background, we get rid of the loading UI
                    // in the cacheHit case.  I think this is okay since in most cases, the list of enabled
                    // features won't change after the background loading is complete.
                    this.isLoading = false;
                    this._copyCachedFeaturesToF1(storageItem);
                }

                return Observable.zip(
                    this._getConfigFeatures(r.site),
                    this._getSiteFeatures(r.site),
                    this._getAuthFeatures(r.site, r.hasSiteWritePermissions, r.hasReadOnlyLock),
                    this._getSiteExtensions(r.site));
            })
            .subscribe((results : EnabledFeatureItem[][]) =>{
                this.isLoading = false;

                let latestFeatureItems : EnabledFeatureItem[] = [];
                results.forEach(result =>{
                    if(result && result.length > 0){
                        result.forEach(featureItem =>{
                            if(featureItem){
                                latestFeatureItems.push(featureItem);
                            }
                        })
                    }
                })

                this._mergeFeaturesIntoF1(this.featureItems, latestFeatureItems);
                this._saveFeatures(this.featureItems);
            })
    }

    set siteInput(site : ArmObj<Site>){
        if(!site){
            return;
        }

        this._siteSubject.next(site);
    }

    openFeature(feature : EnabledFeatureItem){
        if(feature.componentName){
            this.componentName.next(feature.componentName);
        }
        else if(feature.bladeInfo){
            this._portalService.openBlade(feature.bladeInfo, "site-enabled-features");
        }
    }

    private _copyCachedFeaturesToF1(storageItem : EnabledFeatures){
        storageItem.enabledFeatures.forEach((cachedFeatureItem : EnabledFeature) =>{
            let featureItem = this._getEnabledFeatureItem(cachedFeatureItem.feature);
            if(featureItem){
                featureItem.title = cachedFeatureItem.title;
                this.featureItems.push(featureItem);
            }
        })
    }

    private _getEnabledFeatureItem(feature : Feature, ...args: any[]) : EnabledFeatureItem{

        switch(feature){
            case Feature.Cors:
                return <EnabledFeatureItem>{
                    title : "CORS Rules ({0} defined)".format(args),
                    feature : feature,
                    iconUrl : "images/cors.svg",
                    bladeInfo : {
                        detailBlade : "ApiCors",
                        detailBladeInputs : {
                            resourceUri : this._site.id
                        }
                    }
                }

            case Feature.DeploymentSource:
                return <EnabledFeatureItem>{
                    title : "Deployment source configured with {0}".format(args),
                    feature : feature,
                    iconUrl : "images/deployment-source.svg",
                    bladeInfo : {
                        detailBlade : "ContinuousDeploymentListBlade",
                        detailBladeInputs : {
                            id : this._site.id,
                            ResourceId : this._site.id
                        }
                    }
                }

            case Feature.Authentication:
                return <EnabledFeatureItem>{
                    title : "Authentication",
                    feature : feature,
                    iconUrl : "images/authentication.svg",
                    bladeInfo : {
                        detailBlade : "AppAuth",
                        detailBladeInputs : {
                            resourceUri : this._site.id
                        }
                    }
                }

            case Feature.CustomDomains:
                return <EnabledFeatureItem>{
                    title : "Custom domains",
                    feature : feature,
                    iconUrl : "images/custom-domains.svg",
                    bladeInfo : {
                        detailBlade : "CustomDomainsAndSSL",
                        detailBladeInputs : {
                            resourceUri : this._site.id,
                            BuyDomainSelected : false
                        }
                    }
                }

            case Feature.SSLBinding:
                return <EnabledFeatureItem>{
                    title : "SSL certificates",
                    feature : feature,
                    iconUrl : "images/ssl.svg",
                    bladeInfo : {
                        detailBlade : "CertificatesBlade",
                        detailBladeInputs : {
                            resourceUri : this._site.id,
                        }
                    }
                }

            case Feature.ApiDefinition:
                return <EnabledFeatureItem>{
                    title : "API definition",
                    feature : feature,
                    iconUrl : "images/api-definition.svg",
                    bladeInfo : {
                        detailBlade : "ApiDefinition",
                        detailBladeInputs : {
                            resourceUri : this._site.id,
                        }
                    }
                }

            case Feature.WebJobs:
                return <EnabledFeatureItem>{
                    title : "WebJobs ({0} defined)".format(args),
                    feature : feature,
                    iconUrl : "images/webjobs.svg",
                    bladeInfo :
                    {
                        detailBlade : "webjobsNewBlade",
                        detailBladeInputs : {
                            resourceUri : this._site.id
                        }
                    },
                }

            case Feature.SiteExtensions:
                return <EnabledFeatureItem>{
                    title : "Extensions ({0} installed)".format(args),
                    feature : feature,
                    iconUrl : "images/extensions.svg",
                    bladeInfo :
                    {
                        detailBlade : "SiteExtensionsListBlade",
                        detailBladeInputs : {
                            WebsiteId : this._descriptor.getWebsiteId()
                        }
                    },
                }
        }
    }

    private _saveFeatures(featureItems : EnabledFeatureItem[]){
        let enabledFeatures : EnabledFeature[];
        enabledFeatures = featureItems.map(enabledFeature => {
            this._aiService.trackEvent('/site/enabledFeatures', {
                resourceId : this._site.id,
                featureName : enabledFeature.title
            });

            return {
                title : enabledFeature.title,
                feature : enabledFeature.feature
            };
        });

        let item = <EnabledFeatures>{
            id : this._site.id + "/enabledFeatures",
            enabledFeatures : enabledFeatures
        }

        this._storageService.setItem(item.id, item);
    }

    private _mergeFeaturesIntoF1(featureItems1 : EnabledFeatureItem[],
                                 featureItems2 : EnabledFeatureItem[]){

        let removeFeatures : EnabledFeatureItem[] = [];
        featureItems1.forEach(f1 =>{
            let index = featureItems2.findIndex(f2 => f2.feature === f1.feature);
            if(index < 0){
                removeFeatures.push(f1);
            }
        })

        removeFeatures.forEach(rf => {
            let removeIndex = featureItems1.indexOf(rf);
            featureItems1.splice(removeIndex, 1);
        })

        featureItems2.forEach(f2 =>{
            let featureItem = featureItems1.find(f1 => f1.feature === f2.feature);
            if(featureItem){
                featureItem.title = f2.title;
            }
            else{
                featureItems1.push(f2);
            }
        })
    }

    private _getSiteFeatures(site : ArmObj<Site>){
        let items = [];
        if(site.properties.hostNames.length > 1){
            items.push(this._getEnabledFeatureItem(Feature.CustomDomains));
        }

        if(site.properties.hostNameSslStates.length > 2){
            items.push(this._getEnabledFeatureItem(Feature.SSLBinding));
        }

        return Observable.of(items);
    }

    private _getConfigFeatures(site : ArmObj<Site>){

        let configId = `${site.id}/config/web`;
        return this._cacheService.getArm(configId)
            .map(r =>{
                let items = [];
                let config : ArmObj<SiteConfig> = r.json();
                if(config.properties.scmType !== 'None'){
                    items.push(this._getEnabledFeatureItem(Feature.DeploymentSource, config.properties.scmType));
                }

                let cors = config.properties.cors;
                if(cors
                    && cors.allowedOrigins
                    && cors.allowedOrigins.length > 0
                    && this._containsNonDefaultCorsRules(cors.allowedOrigins)){

                    items.push(this._getEnabledFeatureItem(Feature.Cors, cors.allowedOrigins.length));
                }

                if(config.properties.apiDefinition && config.properties.apiDefinition.url){
                    items.push(this._getEnabledFeatureItem(Feature.ApiDefinition));
                }

                return items;
            })
    }

    private _containsNonDefaultCorsRules(allowedOrigins : string[]){
        let nonDefaultRule = allowedOrigins.find(o =>{
            return o.toLowerCase() !== "https://functions.azure.com"
                && o.toLowerCase() !== "https://functions-staging.azure.com"
                && o.toLowerCase() !== "https://functions-next.azure.com";
        })

        return !!nonDefaultRule;
    }

    private _getAuthFeatures(
        site : ArmObj<Site>,
        hasSiteActionPermission : boolean,
        hasReadLock : boolean){

        if(!hasSiteActionPermission|| hasReadLock){
            return Observable.of([]);
        }

        let authId = `${site.id}/config/authsettings/list`;
        return this._cacheService.postArm(authId)
        .map(r =>{
            let authSettings : ArmObj<AuthSettings> = r.json();
            let items = null;

            if(authSettings.properties.enabled){
                items = [this._getEnabledFeatureItem(Feature.Authentication)]
            }

            return items;
        })
    }

    // private _getWebJobs(site : ArmObj<Site>){
    //     let webJobsId = `${site.id}/webjobs`;
    //     return this._cacheService.getArm(webJobsId)
    //         .map(r =>{
    //             let jobs : any[] = r.json().value;
    //             let items = null;

    //             if(jobs && jobs.length > 0){
    //                 items = [this._getEnabledFeatureItem(Feature.WebJobs, jobs.length)];
    //             }

    //             return items;
    //         });
    // }

    private _getSiteExtensions(site : ArmObj<Site>){
        let extensionsId = `${site.id}/siteExtensions`;
        return this._cacheService.getArm(extensionsId)
            .map(r =>{
                let extensions : any[] = r.json().value;
                let items = null;
                if(extensions && extensions.length > 0){
                    items = [this._getEnabledFeatureItem(Feature.SiteExtensions, extensions.length)];
                }

                return items;
            });
    }
}