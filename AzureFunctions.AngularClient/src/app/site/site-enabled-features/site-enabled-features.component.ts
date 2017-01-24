import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {Observable, Subject, Subscription as RxSubscription} from 'rxjs/Rx';
import {CacheService} from '../../shared/services/cache.service';
import {RBACService} from '../../shared/services/rbac.service';
import {LocalStorageService as StorageService} from '../../shared/services/local-storage.service';
import {Site} from '../../shared/models/arm/site';
import {SiteConfig} from '../../shared/models/arm/site-config';
import {ArmObj} from '../../shared/models/arm/arm-obj';
import {StorageItem} from '../../shared/models/localStorage/local-storage';
import {Feature, EnabledFeature, EnabledFeatureItem} from '../../shared/models/localStorage/enabled-features';

interface EnabledFeatureMap{
    [key : number] : EnabledFeatureItem;
}

@Component({
    selector: 'site-enabled-features',
    templateUrl: './site-enabled-features.component.html',
    styleUrls: ['../site-dashboard/site-dashboard.component.scss'],
    inputs: ['siteInput'],
    outputs: ['componentName']
})

export class SiteEnabledFeaturesComponent {

    // F1 is what actually gets displayed and F2 is only used for background population.
    // Cache Miss:
    //  - F1 will get populated as requests complete.  Once loading is complete, it will be saved to local storage
    //  - F2 is not used at all.
    //
    // Cache Hit:
    // - F1 is populated immediately from local storage
    // - F2 is populated in the background.  Once loading is complete it will be saved to local storage
    //   and then merged into F1
    public featureItems1 : EnabledFeatureItem[] = [];
    public featureItems2 : EnabledFeatureItem[] = [];
    public isLoading : boolean;
    public componentName = new Subject<string>();

    private _site : ArmObj<Site>;
    private _siteSubject = new Subject<ArmObj<Site>>();
    private _cacheHit = false;

    private _enabledFeatureMap = <EnabledFeatureMap>{
        [Feature.WebJobs] : {
            title : "Web Job ({0})",
            feature : Feature.WebJobs,
            componentName : null,
            isBlade : true
        },
        [Feature.DeploymentSource] : {
            title : "Deployment Source configured with {0}",
            feature : Feature.DeploymentSource,
            componentName : "deployment-source",
            isBlade : false
        },
        [Feature.SiteExtensions] : {
            title : "Extension ({0})",
            feature : Feature.SiteExtensions,
            componentName : null,
            isBlade : true
        },
        [Feature.Cors] : {
            title : "CORS Rule ({0})",
            feature : Feature.Cors,
            componentName : null,
            isBlade : true
        }
    }

    constructor(
        private _cacheService : CacheService,
        private _storageService : StorageService) {

        this._siteSubject
            .distinctUntilChanged()
            .switchMap(site =>{
                this._site = site;
                this.featureItems1 = [];
                this.featureItems2 = [];
                this.isLoading = true;
                this._cacheHit = false;

                let storageItem = this._storageService.getItem(site.id);
                if(storageItem && storageItem.enabledFeatures){

                    // Even though we continue loading in the background, we get rid of the loading UI
                    // in the cacheHit case.  I think this is okay since in most cases, the list of enabled
                    // features won't change after the background loading is complete.
                    this.isLoading = false;
                    this._cacheHit = true;
                    this._copyCachedFeaturesToF1(storageItem);
                }

                return Observable.zip(
                    this._getConfig(site),
                    this._getWebJobs(site),
                    this._getSiteExtensions(site));
            })
            .subscribe(result =>{
                this.isLoading = false;
                this._saveFeatures();
                this._mergeFeaturesIntoF1(this._cacheHit, this.featureItems1, this.featureItems2);
            })
    }

    set siteInput(site : ArmObj<Site>){
        if(!site){
            return;
        }

        this._siteSubject.next(site);
    }

    openFeature(feature : EnabledFeatureItem){
        if(!feature.isBlade){
            this.componentName.next(feature.componentName);
        }
    }

    private _copyCachedFeaturesToF1(storageItem : StorageItem){
        storageItem.enabledFeatures.forEach((cachedFeatureItem : EnabledFeature) =>{
            let featureItem = this._getEnabledFeatureItem(cachedFeatureItem.feature);
            featureItem.title = cachedFeatureItem.title;
            this.featureItems1.push(featureItem);
        })
    }

    private _getEnabledFeatureItem(feature : Feature) : EnabledFeatureItem{
        return JSON.parse(JSON.stringify(this._enabledFeatureMap[feature]));
    }

    private _addFeature(featureItem : EnabledFeatureItem){
        if(this._cacheHit){
            this.featureItems2.push(featureItem);
        }
        else{
            this.featureItems1.push(featureItem);
        }
    }

    private _saveFeatures(){
        let enabledFeatures : EnabledFeature[];
        if(this._cacheHit){
            enabledFeatures = this.featureItems2.map(enabledFeature => {
                return {
                    title : enabledFeature.title,
                    feature : enabledFeature.feature
                }
            });
        }
        else{
            enabledFeatures = this.featureItems1.map(enabledFeature => {
                return {
                    title : enabledFeature.title,
                    feature : enabledFeature.feature
                };
            });
        }

        let item = this._storageService.getItem(this._site.id);
        if(item){
            item.enabledFeatures = enabledFeatures;
        }
        else{
            item = <StorageItem>{
                id : this._site.id,
                enabledFeatures : enabledFeatures
            }
        }

        this._storageService.setItem(this._site.id, item);
        this._storageService.commit();
    }

    private _mergeFeaturesIntoF1(cacheHit : boolean,
                                 featureItems1 : EnabledFeatureItem[],
                                 featureItems2 : EnabledFeatureItem[]){
        if(!cacheHit){
            return;
        }

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

    private _getConfig(site : ArmObj<Site>){
        let configId = `${site.id}/config/web`;
        return this._cacheService.getArmResource(configId)
            .map((config : ArmObj<SiteConfig>)=>{
                if(config.properties.scmType !== 'None'){
                    this._addFeatureWithTitleFormat(Feature.DeploymentSource, config.properties.scmType);
                }

                if(config.properties.cors
                    && config.properties.cors.allowedOrigins
                    && config.properties.cors.allowedOrigins.length > 0){

                    this._addFeatureWithTitleFormat(Feature.Cors, config.properties.cors.allowedOrigins.length);
                }

                return config;
            })
    }

    private _getWebJobs(site : ArmObj<Site>){
        let webJobsId = `${site.id}/webjobs`;
        return this._cacheService.getArmResources(webJobsId)
            .map((jobs : any[]) =>{
                if(jobs && jobs.length > 0){
                    this._addFeatureWithTitleFormat(Feature.WebJobs, jobs.length);
                }

                return jobs;
            });
    }

    private _getSiteExtensions(site : ArmObj<Site>){
        let extensionsId = `${site.id}/siteExtensions`;
        return this._cacheService.getArmResources(extensionsId)
            .map((extensions : any[]) =>{
                if(extensions && extensions.length > 0){
                    this._addFeatureWithTitleFormat(Feature.SiteExtensions, extensions.length);
                }

                return extensions;
            });
    }

    private _addFeatureWithTitleFormat(feature : Feature, ...args: any[]){
        let featureItem = this._getEnabledFeatureItem(feature);
        featureItem.title = featureItem.title.format.apply(featureItem.title, args);
        this._addFeature(featureItem);
    }

}