import { ElementRef, Input } from '@angular/core';
import { Dom } from './../../shared/Utilities/dom';
import { SiteDashboardComponent } from './../site-dashboard/site-dashboard.component';
import { SiteTabIds, KeyCodes } from './../../shared/models/constants';
import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import { TranslateService } from '@ngx-translate/core';

import { PortalResources } from './../../shared/models/portal-resources';
import { GlobalStateService } from './../../shared/services/global-state.service';
import { AiService } from './../../shared/services/ai.service';
import { SiteDescriptor } from './../../shared/resourceDescriptors';
import { AuthzService } from './../../shared/services/authz.service';
import { AuthSettings } from './../../shared/models/arm/auth-settings';
import { PortalService } from './../../shared/services/portal.service';
import { CacheService } from '../../shared/services/cache.service';
import { LocalStorageService as StorageService } from '../../shared/services/local-storage.service';
import { Site } from '../../shared/models/arm/site';
import { SiteConfig } from '../../shared/models/arm/site-config';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Feature, EnabledFeatures, EnabledFeature, EnabledFeatureItem } from '../../shared/models/localStorage/enabled-features';
import { FunctionAppService } from '../../shared/services/function-app.service';

@Component({
    selector: 'site-enabled-features',
    templateUrl: './site-enabled-features.component.html',
    styleUrls: ['./site-enabled-features.component.scss']
})

// First load list of enabled features from localStorage
// Then it continues to pull from the back-end to refresh the UI
// and update what's cached in localStorage
export class SiteEnabledFeaturesComponent {

    public featureItems: EnabledFeatureItem[] = [];
    public isLoading: boolean;

    private _site: ArmObj<Site>;
    private _siteSubject = new Subject<ArmObj<Site>>();
    private _descriptor: SiteDescriptor;
    private _focusedFeatureIndex = -1;

    @ViewChild('enabledFeatures') featureList: ElementRef;

    constructor(
        private _cacheService: CacheService,
        private _storageService: StorageService,
        private _portalService: PortalService,
        private _authZService: AuthzService,
        private _aiService: AiService,
        private _translateService: TranslateService,
        private _globalStateService: GlobalStateService,
        private _siteDashboard: SiteDashboardComponent,
        private _functionAppService: FunctionAppService) {

        this._siteSubject
            .distinctUntilChanged()
            .switchMap(site => {
                this._site = site;
                this.featureItems = [];
                this.isLoading = true;

                this._descriptor = new SiteDescriptor(site.id);

                return Observable.zip(
                    this._authZService.hasPermission(site.id, [AuthzService.writeScope]),
                    this._authZService.hasReadOnlyLock(site.id),
                    (w, l) => ({ hasSiteWritePermissions: w, hasReadOnlyLock: l })
                )
                    .map(r => {
                        return {
                            site: site,
                            hasSiteWritePermissions: r.hasSiteWritePermissions,
                            hasReadOnlyLock: r.hasReadOnlyLock
                        };
                    });
            })
            .switchMap(r => {

                const storageItem = <EnabledFeatures>this._storageService.getItem(r.site.id + '/enabledFeatures');
                if (storageItem && storageItem.enabledFeatures && storageItem.enabledFeatures.length > 0) {

                    // Even though we continue loading in the background, we get rid of the loading UI
                    // in the cacheHit case.  I think this is okay since in most cases, the list of enabled
                    // features won't change after the background loading is complete.
                    this.isLoading = false;
                    this._copyCachedFeaturesToF1(storageItem);
                } else {
                    this._addDefaultItems(this.featureItems);
                }

                return Observable.zip(
                    this._getConfigFeatures(r.site),
                    this._getSiteFeatures(r.site),
                    this._getAuthFeatures(r.site, r.hasSiteWritePermissions, r.hasReadOnlyLock),
                    this._getSiteExtensions(r.site),
                    this._getAppInsights(r.hasSiteWritePermissions, r.hasReadOnlyLock));
            })
            .do(null, e => {
                if (!this._globalStateService.showTryView) {
                    this._aiService.trackException(e, 'site-enabled-features');
                } else {
                    this.isLoading = false;
                }
            })
            .retry()
            .subscribe((results: EnabledFeatureItem[][]) => {
                this.isLoading = false;

                const latestFeatureItems: EnabledFeatureItem[] = [];

                // Need to add default items to latest otherwise they'll be removed from featureItems during merge.
                this._addDefaultItems(latestFeatureItems);

                results.forEach(result => {
                    if (result && result.length > 0) {
                        result.forEach(featureItem => {
                            if (featureItem) {
                                latestFeatureItems.push(featureItem);
                            }
                        });
                    }
                });

                this._mergeFeaturesIntoF1(this.featureItems, latestFeatureItems);
                this._saveFeatures(this.featureItems);

                if (this.featureItems.length > 0) {
                    this.featureItems[0].focusable = true;
                    this._focusedFeatureIndex = 0;
                }
            });
    }


    @Input()
    set siteInput(site: ArmObj<Site>) {
        if (!site) {
            return;
        }

        this._siteSubject.next(site);
    }

    openFeature(feature: EnabledFeatureItem) {
        if (feature.featureId) {
            this._siteDashboard.openFeature(feature.featureId);
        } else if (feature.bladeInfo) {
            this._portalService.openBlade(feature.bladeInfo, 'site-enabled-features');
        }
    }

    private _getAppInsights(hasSiteActionPermission: boolean, hasReadLock: boolean) {

        if (!hasSiteActionPermission || hasReadLock || (window && window.appsvc && window.appsvc.env && window.appsvc.env.runtimeType === "OnPrem")) {
            return Observable.of([]);
        }

        return this._functionAppService.isAppInsightsEnabled(this._site.id).flatMap((aiId) => {
            const items = [];
            if (aiId) {
                items.push(this._getEnabledFeatureItem(Feature.AppInsight, aiId));
            }
            return Observable.of(items);
        });
    }

    private _copyCachedFeaturesToF1(storageItem: EnabledFeatures) {
        storageItem.enabledFeatures.forEach((cachedFeatureItem: EnabledFeature) => {
            const featureItem = this._getEnabledFeatureItem(cachedFeatureItem.feature);
            if (featureItem) {
                featureItem.title = cachedFeatureItem.title;
                this.featureItems.push(featureItem);
            }
        });
    }

    private _addDefaultItems(features: EnabledFeature[]) {
        const functionSettings = this._getEnabledFeatureItem(Feature.FunctionSettings);
        const appSettings = this._getEnabledFeatureItem(Feature.AppSettings);
        features.splice(0, 0, functionSettings, appSettings);
    }

    private _getEnabledFeatureItem(feature: Feature, ...args: any[]): EnabledFeatureItem {

        switch (feature) {
            case Feature.FunctionSettings:
                return <EnabledFeatureItem>{
                    title: this._translateService.instant(PortalResources.tab_functionSettings),
                    feature: feature,
                    iconUrl: 'image/functions.svg',
                    featureId: SiteTabIds.functionRuntime
                };

            case Feature.AppSettings:
                return <EnabledFeatureItem>{
                    title: this._translateService.instant(PortalResources.feature_applicationSettingsName),
                    feature: feature,
                    iconUrl: 'image/application-settings.svg',
                    featureId: SiteTabIds.applicationSettings
                };

            case Feature.AppInsight:
                return <EnabledFeatureItem>{
                    title: this._translateService.instant(PortalResources.featureEnabled_appInsights),
                    feature: feature,
                    iconUrl: 'image/appInsights.svg',
                    bladeInfo: {
                        detailBlade: 'AspNetOverview',
                        detailBladeInputs: {
                            id: args[0]
                        },
                        extension: 'AppInsightsExtension'
                    }
                };

            case Feature.Cors:
                return <EnabledFeatureItem>{
                    title: this._translateService.instant(PortalResources.featureEnabled_cors).format(args),
                    feature: feature,
                    iconUrl: 'image/cors.svg',
                    bladeInfo: {
                        detailBlade: 'ApiCors',
                        detailBladeInputs: {
                            resourceUri: this._site.id
                        }
                    }
                };

            case Feature.DeploymentSource:
                return <EnabledFeatureItem>{
                    title: this._translateService.instant(PortalResources.featureEnabled_deploymentSource).format(args),
                    feature: feature,
                    iconUrl: 'image/deployment-source.svg',
                    bladeInfo: {
                        detailBlade: 'ContinuousDeploymentListBlade',
                        detailBladeInputs: {
                            id: this._site.id,
                            ResourceId: this._site.id
                        }
                    }
                };

            case Feature.Authentication:
                return <EnabledFeatureItem>{
                    title: this._translateService.instant(PortalResources.authentication),
                    feature: feature,
                    iconUrl: 'image/authentication.svg',
                    bladeInfo: {
                        detailBlade: 'AppAuth',
                        detailBladeInputs: {
                            resourceUri: this._site.id
                        }
                    }
                };

            case Feature.CustomDomains:
                return <EnabledFeatureItem>{
                    title: this._translateService.instant(PortalResources.feature_customDomainsName),
                    feature: feature,
                    iconUrl: 'image/custom-domains.svg',
                    bladeInfo: {
                        detailBlade: 'CustomDomainsAndSSL',
                        detailBladeInputs: {
                            resourceUri: this._site.id,
                            BuyDomainSelected: false
                        }
                    }
                };

            case Feature.SSLBinding:
                return <EnabledFeatureItem>{
                    title: this._translateService.instant(PortalResources.featureEnabled_sslCert),
                    feature: feature,
                    iconUrl: 'image/ssl.svg',
                    bladeInfo: {
                        detailBlade: 'CertificatesBlade',
                        detailBladeInputs: {
                            resourceUri: this._site.id,
                        }
                    }
                };

            case Feature.ApiDefinition:
                return <EnabledFeatureItem>{
                    title: this._translateService.instant(PortalResources.feature_apiDefinitionName),
                    feature: feature,
                    iconUrl: 'image/api-definition.svg',
                    featureId: SiteTabIds.apiDefinition
                };

            case Feature.WebJobs:
                return <EnabledFeatureItem>{
                    title: this._translateService.instant(PortalResources.featureEnabled_webjobs).format(args),
                    feature: feature,
                    iconUrl: 'image/webjobs.svg',
                    bladeInfo:
                        {
                            detailBlade: 'webjobsNewBlade',
                            detailBladeInputs: {
                                resourceUri: this._site.id
                            }
                        },
                };

            case Feature.SiteExtensions:
                return <EnabledFeatureItem>{
                    title: this._translateService.instant(PortalResources.featureEnabled_extensions).format(args),
                    feature: feature,
                    iconUrl: 'image/extensions.svg',
                    bladeInfo:
                        {
                            detailBlade: 'SiteExtensionsListBlade',
                            detailBladeInputs: {
                                WebsiteId: this._descriptor.getWebsiteId()
                            }
                        },
                };
        }
    }

    private _saveFeatures(featureItems: EnabledFeatureItem[]) {
        let enabledFeatures: EnabledFeature[];
        enabledFeatures = featureItems.map(enabledFeature => {
            this._aiService.trackEvent('/site/enabledFeatures', {
                resourceId: this._site.id,
                featureName: Feature[enabledFeature.feature]
            });

            return {
                title: enabledFeature.title,
                feature: enabledFeature.feature
            };
        });

        const item = <EnabledFeatures>{
            id: this._site.id + '/enabledFeatures',
            enabledFeatures: enabledFeatures
        };

        this._storageService.setItem(item.id, item);
    }

    private _mergeFeaturesIntoF1(
        featureItems1: EnabledFeatureItem[],
        featureItems2: EnabledFeatureItem[]) {

        const removeFeatures: EnabledFeatureItem[] = [];
        featureItems1.forEach(f1 => {
            const index = featureItems2.findIndex(f2 => f2.feature === f1.feature);
            if (index < 0) {
                removeFeatures.push(f1);
            }
        });

        removeFeatures.forEach(rf => {
            const removeIndex = featureItems1.indexOf(rf);
            featureItems1.splice(removeIndex, 1);
        });

        featureItems2.forEach(f2 => {
            const featureItem = featureItems1.find(f1 => f1.feature === f2.feature);
            if (featureItem) {
                featureItem.title = f2.title;
                featureItem.bladeInfo = f2.bladeInfo;
            } else {
                featureItems1.push(f2);
            }
        });
    }

    private _getSiteFeatures(site: ArmObj<Site>) {
        const items = [];
        if (site.properties.hostNames.length > 1) {
            items.push(this._getEnabledFeatureItem(Feature.CustomDomains));
        }

        if (site.properties.hostNameSslStates.length > 2) {
            items.push(this._getEnabledFeatureItem(Feature.SSLBinding));
        }

        return Observable.of(items);
    }

    private _getConfigFeatures(site: ArmObj<Site>) {

        const configId = `${site.id}/config/web`;
        return this._cacheService.getArm(configId)
            .map(r => {
                const items = [];
                const config: ArmObj<SiteConfig> = r.json();
                if (config.properties.scmType !== 'None') {
                    items.push(this._getEnabledFeatureItem(Feature.DeploymentSource, config.properties.scmType));
                }

                const cors = config.properties.cors;
                if (cors
                    && cors.allowedOrigins
                    && cors.allowedOrigins.length > 0
                    && this._containsNonDefaultCorsRules(cors.allowedOrigins)) {

                    items.push(this._getEnabledFeatureItem(Feature.Cors, cors.allowedOrigins.length));
                }

                if (config.properties.apiDefinition && config.properties.apiDefinition.url) {
                    items.push(this._getEnabledFeatureItem(Feature.ApiDefinition));
                }

                return items;
            });
    }

    private _containsNonDefaultCorsRules(allowedOrigins: string[]) {
        const nonDefaultRule = allowedOrigins.find(o => {
            return o.toLowerCase() !== 'https://functions.azure.com'
                && o.toLowerCase() !== 'https://functions-staging.azure.com'
                && o.toLowerCase() !== 'https://functions-next.azure.com';
        });

        return !!nonDefaultRule;
    }

    private _getAuthFeatures(
        site: ArmObj<Site>,
        hasSiteActionPermission: boolean,
        hasReadLock: boolean) {

        if (!hasSiteActionPermission || hasReadLock) {
            return Observable.of([]);
        }

        const authId = `${site.id}/config/authsettings/list`;
        return this._cacheService.postArm(authId)
            .map(r => {
                const authSettings: ArmObj<AuthSettings> = r.json();
                let items = null;

                if (authSettings.properties.enabled) {
                    items = [this._getEnabledFeatureItem(Feature.Authentication)];
                }

                return items;
            });
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

    private _getSiteExtensions(site: ArmObj<Site>) {
        const extensionsId = `${site.id}/siteExtensions`;
        return this._cacheService.getArm(extensionsId)
            .map(r => {
                const extensions: any[] = r.json().value;
                let items = null;
                if (extensions && extensions.length > 0) {
                    items = [this._getEnabledFeatureItem(Feature.SiteExtensions, extensions.length)];
                }

                return items;
            });
    }

    private _getFeatures() {
        return this.featureList.nativeElement.children;
    }

    private _clearFocusOnFeature(features: HTMLCollection, index: number) {
        const oldFeature = Dom.getTabbableControl(<HTMLElement>features[index]);
        this.featureItems[index].focusable = false;
        Dom.clearFocus(oldFeature);
    }

    private _setFocusOnFeature(features: HTMLCollection, index: number) {
        let finalIndex = -1;
        let destFeature: Element;

        if (index >= 0 && index < features.length) {
            finalIndex = index;
            destFeature = features[index].children[1];
        } else if (features.length > 0) {
            if (index === -1) {
                finalIndex = 0;
                destFeature = features[0].children[1];
            } else {
                finalIndex = features.length - 1;
                destFeature = features[finalIndex];
            }
        }

        if (destFeature) {
            const newFeature = Dom.getTabbableControl(<HTMLElement>destFeature);
            this.featureItems[finalIndex].focusable = true;
            Dom.setFocus(<HTMLElement>newFeature);
        }

        this._focusedFeatureIndex = finalIndex;
    }


    onKeyPress(event: KeyboardEvent, featureItem: EnabledFeatureItem) {
        if (event.keyCode === KeyCodes.enter) {
            this.openFeature(featureItem);

        } else if (event.keyCode === KeyCodes.arrowDown) {
            const features = this._getFeatures();
            this._clearFocusOnFeature(features, this._focusedFeatureIndex);
            this._setFocusOnFeature(features, this._focusedFeatureIndex + 1);
            event.preventDefault();

        } else if (event.keyCode === KeyCodes.arrowUp) {
            const features = this._getFeatures();
            this._clearFocusOnFeature(features, this._focusedFeatureIndex);
            this._setFocusOnFeature(features, this._focusedFeatureIndex - 1);
            event.preventDefault();

        }
    }
}
