import { SiteService } from 'app/shared/services/site.service';
import { ElementRef, Input, Injector } from '@angular/core';
import { Dom } from './../../shared/Utilities/dom';
import { SiteDashboardComponent } from './../site-dashboard/site-dashboard.component';
import { SiteTabIds, KeyCodes, ScenarioIds } from './../../shared/models/constants';
import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from './../../shared/models/portal-resources';
import { AiService } from './../../shared/services/ai.service';
import { ArmSiteDescriptor } from './../../shared/resourceDescriptors';
import { AuthzService } from './../../shared/services/authz.service';
import { PortalService } from './../../shared/services/portal.service';
import { LocalStorageService as StorageService } from '../../shared/services/local-storage.service';
import { Site } from '../../shared/models/arm/site';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Feature, EnabledFeatures, EnabledFeature, EnabledFeatureItem } from '../../shared/models/localStorage/enabled-features';
import { ScenarioService } from '../../shared/services/scenario/scenario.service';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { ApplicationInsightsService } from '../../shared/services/application-insights.service';

@Component({
  selector: 'site-enabled-features',
  templateUrl: './site-enabled-features.component.html',
  styleUrls: ['./site-enabled-features.component.scss'],
})

// First load list of enabled features from localStorage
// Then it continues to pull from the back-end to refresh the UI
// and update what's cached in localStorage
export class SiteEnabledFeaturesComponent extends FeatureComponent<ArmObj<Site>> {
  public featureItems: EnabledFeatureItem[] = [];
  public isLoading: boolean;

  private _site: ArmObj<Site>;
  private _descriptor: ArmSiteDescriptor;
  private _focusedFeatureIndex = -1;

  @ViewChild('enabledFeatures')
  featureList: ElementRef;

  constructor(
    private _storageService: StorageService,
    private _portalService: PortalService,
    private _authZService: AuthzService,
    private _aiService: AiService,
    private _translateService: TranslateService,
    private _siteService: SiteService,
    private _siteDashboard: SiteDashboardComponent,
    private _scenarioService: ScenarioService,
    private _applicationInsightsService: ApplicationInsightsService,
    injector: Injector
  ) {
    super('site-enabled-features', injector, null);
  }

  @Input()
  set siteInput(site: ArmObj<Site>) {
    if (!site) {
      return;
    }

    this.setInput(site);
  }

  protected setup(inputEvents: Observable<ArmObj<Site>>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(site => {
        this._site = site;
        this.featureItems = [];
        this.isLoading = true;

        this._descriptor = new ArmSiteDescriptor(site.id);

        return Observable.zip(
          this._authZService.hasPermission(site.id, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(site.id),
          (w, l) => ({ hasSiteWritePermissions: w, hasReadOnlyLock: l })
        ).map(r => {
          return {
            site: site,
            hasSiteWritePermissions: r.hasSiteWritePermissions,
            hasReadOnlyLock: r.hasReadOnlyLock,
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
          this.featureItems = this._getCachedFeatures(storageItem);
        } else {
          this.featureItems = this._getDefaultItems();
        }

        return Observable.zip(
          this._getConfigFeatures(r.site),
          this._getSiteFeatures(r.site),
          this._getAuthFeatures(r.site),
          this._getSiteExtensions(r.site),
          this._getAppInsights(r.hasSiteWritePermissions, r.hasReadOnlyLock)
        );
      })
      .do((results: EnabledFeatureItem[][]) => {
        this.isLoading = false;

        // Need to add default items to latest otherwise they'll be removed from featureItems during merge.
        const defaultFeatureItems: EnabledFeatureItem[] = this._getDefaultItems();

        // flatten not a built-in function (yet)
        const flattenedResults = results.reduce((list1, list2) => list1.concat(list2)).filter(ele => ele); //remove nulls

        // union of defaultFeatureItems and flattenedResults
        const mergedFeatures = defaultFeatureItems.concat(flattenedResults);
        this.featureItems = mergedFeatures.filter((elem, index) => {
          return mergedFeatures.findIndex(f => f.feature === elem.feature) === index;
        });
        this._saveFeatures(this.featureItems);

        if (this.featureItems.length > 0) {
          this.featureItems[0].focusable = true;
          this._focusedFeatureIndex = 0;
        }
      });
  }

  openFeature(feature: EnabledFeatureItem) {
    if (feature.featureId) {
      this._siteDashboard.openFeature(feature.featureId);
    } else if (feature.bladeInfo) {
      this._portalService.openBladeDeprecated(feature.bladeInfo, 'site-enabled-features');
    }
  }

  private _getAppInsights(hasSiteActionPermission: boolean, hasReadLock: boolean) {
    if (
      !hasSiteActionPermission ||
      hasReadLock ||
      (window && window.appsvc && window.appsvc.env && window.appsvc.env.runtimeType === 'OnPrem')
    ) {
      return Observable.of([]);
    }

    return this._applicationInsightsService
      .getApplicationInsightResource(this._site.id)
      .flatMap(resource => {
        const items = [];
        if (resource) {
          items.push(this._getEnabledFeatureItem(Feature.AppInsight, resource.id));
        }
        return Observable.of(items);
      })
      .catch(e => {
        return Observable.of(null);
      });
  }

  private _getCachedFeatures(storageItem: EnabledFeatures) {
    return storageItem.enabledFeatures
      .filter(f => f.feature !== Feature.AppInsight)
      .map((cachedFeatureItem: EnabledFeature) => {
        const featureItem = this._getEnabledFeatureItem(cachedFeatureItem.feature);
        if (featureItem) {
          featureItem.title = cachedFeatureItem.title;
        }
        return featureItem;
      })
      .filter(ele => ele); // remove nulls
  }

  private _getDefaultItems() {
    const functionSettings = this._getEnabledFeatureItem(Feature.FunctionSettings);
    const appSettings = this._getEnabledFeatureItem(Feature.AppSettings);
    return [functionSettings, appSettings];
  }

  private _getEnabledFeatureItem(feature: Feature, ...args: any[]): EnabledFeatureItem {
    switch (feature) {
      case Feature.FunctionSettings:
        return <EnabledFeatureItem>{
          title: this._translateService.instant(PortalResources.tab_functionSettings),
          feature: feature,
          iconUrl: 'image/functions.svg',
          featureId: SiteTabIds.functionRuntime,
        };

      case Feature.AppSettings:
        return <EnabledFeatureItem>{
          title: this._translateService.instant(PortalResources.feature_configuration),
          feature: feature,
          iconUrl: 'image/application-settings.svg',
          bladeInfo: {
            detailBlade: 'SiteConfigSettingsFrameBladeReact',
            detailBladeInputs: {
              id: this._descriptor.resourceId,
            },
          },
        };

      case Feature.AppInsight:
        return <EnabledFeatureItem>{
          title: this._translateService.instant(PortalResources.featureEnabled_appInsights),
          feature: feature,
          iconUrl: 'image/appInsights.svg',
          bladeInfo: {
            detailBlade: 'AspNetOverviewV3',
            detailBladeInputs: {
              id: args[0],
            },
            extension: 'AppInsightsExtension',
          },
        };

      case Feature.Cors:
        return <EnabledFeatureItem>{
          title: this._translateService.instant(PortalResources.featureEnabled_cors).format(args),
          feature: feature,
          iconUrl: 'image/cors.svg',
          bladeInfo: {
            detailBlade: 'ApiCors',
            detailBladeInputs: {
              resourceUri: this._site.id,
            },
          },
        };

      case Feature.DeploymentSource:
        return <EnabledFeatureItem>{
          title: this._translateService.instant(PortalResources.featureEnabled_deploymentSource).format(args),
          feature: feature,
          iconUrl: 'image/deployment-source.svg',
          featureId: SiteTabIds.continuousDeployment,
        };

      case Feature.Authentication:
        return <EnabledFeatureItem>{
          title: this._translateService.instant(PortalResources.authentication),
          feature: feature,
          iconUrl: 'image/authentication.svg',
          bladeInfo: {
            detailBlade: 'AppAuth',
            detailBladeInputs: {
              resourceUri: this._site.id,
            },
          },
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
              BuyDomainSelected: false,
            },
          },
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
            },
          },
        };

      case Feature.ApiDefinition:
        return <EnabledFeatureItem>{
          title: this._translateService.instant(PortalResources.feature_apiDefinitionName),
          feature: feature,
          iconUrl: 'image/api-definition.svg',
          featureId: SiteTabIds.apiDefinition,
        };

      case Feature.WebJobs:
        return <EnabledFeatureItem>{
          title: this._translateService.instant(PortalResources.featureEnabled_webjobs).format(args),
          feature: feature,
          iconUrl: 'image/webjobs.svg',
          bladeInfo: {
            detailBlade: 'webjobsNewBlade',
            detailBladeInputs: {
              resourceUri: this._site.id,
            },
          },
        };

      case Feature.SiteExtensions:
        return <EnabledFeatureItem>{
          title: this._translateService.instant(PortalResources.featureEnabled_extensions).format(args),
          feature: feature,
          iconUrl: 'image/extensions.svg',
          bladeInfo: {
            detailBlade: 'SiteExtensionsListBlade',
            detailBladeInputs: {
              WebsiteId: this._descriptor.getWebsiteId(),
            },
          },
        };
    }
  }

  private _saveFeatures(featureItems: EnabledFeatureItem[]) {
    let enabledFeatures: EnabledFeature[];
    enabledFeatures = featureItems
      .map(enabledFeature => {
        this._aiService.trackEvent('/site/enabledFeatures', {
          resourceId: this._site.id,
          featureName: Feature[enabledFeature.feature],
        });

        return {
          title: enabledFeature.title,
          feature: enabledFeature.feature,
        };
      })
      .filter(f => f.feature !== Feature.AppInsight);

    const item = <EnabledFeatures>{
      id: this._site.id + '/enabledFeatures',
      enabledFeatures: enabledFeatures,
    };

    this._storageService.setItem(item.id, item);
  }

  private _getSiteFeatures(site: ArmObj<Site>) {
    const items = [];
    if (site.properties.hostNames && site.properties.hostNames.length > 1) {
      items.push(this._getEnabledFeatureItem(Feature.CustomDomains));
    }

    if (site.properties.hostNameSslStates && site.properties.hostNameSslStates.length > 2) {
      items.push(this._getEnabledFeatureItem(Feature.SSLBinding));
    }

    return Observable.of(items);
  }

  private _getConfigFeatures(site: ArmObj<Site>) {
    return this._siteService.getSiteConfig(site.id).map(r => {
      const items = [];
      const config = r.result;
      if (r.isSuccessful) {
        if (config.properties.scmType !== 'None') {
          items.push(this._getEnabledFeatureItem(Feature.DeploymentSource, config.properties.scmType));
        }

        const cors = config.properties.cors;
        if (cors && cors.allowedOrigins && cors.allowedOrigins.length > 0 && this._containsNonDefaultCorsRules(cors.allowedOrigins)) {
          items.push(this._getEnabledFeatureItem(Feature.Cors, cors.allowedOrigins.length));
        }

        if (config.properties.apiDefinition && config.properties.apiDefinition.url) {
          items.push(this._getEnabledFeatureItem(Feature.ApiDefinition));
        }
      }

      return items;
    });
  }

  private _containsNonDefaultCorsRules(allowedOrigins: string[]) {
    const nonDefaultRule = allowedOrigins.find(o => {
      return (
        o.toLowerCase() !== 'https://functions.azure.com' &&
        o.toLowerCase() !== 'https://functions-staging.azure.com' &&
        o.toLowerCase() !== 'https://functions-next.azure.com'
      );
    });

    return !!nonDefaultRule;
  }

  private _getAuthFeatures(site: ArmObj<Site>) {
    return this._siteService.getAuthSettings(site.id).map(r => {
      let items: EnabledFeatureItem[] = null;
      if (r.isSuccessful) {
        const authSettings = r.result;

        if (authSettings.properties.enabled) {
          items = [this._getEnabledFeatureItem(Feature.Authentication)];
        }
      }

      return items;
    });
  }

  private _getSiteExtensions(site: ArmObj<Site>) {
    const listExtensionsDisabled = this._scenarioService.checkScenario(ScenarioIds.listExtensionsArm, { site: site }).status === 'disabled';
    if (listExtensionsDisabled) {
      return Observable.of([]);
    } else {
      return this._siteService.getSiteExtensions(site.id).map(r => {
        let items: EnabledFeatureItem[] = null;

        if (r.isSuccessful) {
          const extensions = r.result.value;
          if (extensions && extensions.length > 0) {
            items = [this._getEnabledFeatureItem(Feature.SiteExtensions, extensions.length)];
          }
        }

        return items;
      });
    }
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
