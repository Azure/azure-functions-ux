import { SiteData } from './../../tree-view/models/tree-view-info';
import { Url } from './../../shared/Utilities/url';
import { LocalStorageService } from './../../shared/services/local-storage.service';
import { Component, OnInit, EventEmitter, Input, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';

import { ConfigService } from './../../shared/services/config.service';
import { PortalService } from './../../shared/services/portal.service';
import { PortalResources } from './../../shared/models/portal-resources';
import { AiService } from './../../shared/services/ai.service';
import { SiteTabIds, LocalStorageKeys, EnableTabFeature } from './../../shared/models/constants';
import { AppNode } from './../../tree-view/app-node';
import { TabsComponent } from '../../tabs/tabs.component';
import { TabComponent } from '../../tab/tab.component';
import { CacheService } from '../../shared/services/cache.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { DashboardType } from '../../tree-view/models/dashboard-type';
import { Descriptor, SiteDescriptor } from '../../shared/resourceDescriptors';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Site } from '../../shared/models/arm/site';
import { PartSize } from '../../shared/models/portal';
import { TabSettings } from './../../shared/models/localStorage/local-storage';

@Component({
    selector: 'site-dashboard',
    templateUrl: './site-dashboard.component.html',
    styleUrls: ['./site-dashboard.component.scss'],
    inputs: ['viewInfoInput']
})

export class SiteDashboardComponent {
    @ViewChild(TabsComponent) tabs: TabsComponent;

    public selectedTabId: string = SiteTabIds.overview;

    // For now I'm just hard-coding tab positions to 0 = Function settings, 1 = API definition.
    // If we end up doing a full tabs implementation, it would have to be dynamic
    public dynamicTabIds: (string | null)[] = [null, null];
    public site: ArmObj<Site>;
    public viewInfoStream: Subject<TreeViewInfo<SiteData>>;
    public viewInfo: TreeViewInfo<SiteData>;
    public TabIds = SiteTabIds;
    public Resources = PortalResources;
    public isStandalone = false;
    public tabsFeature: EnableTabFeature;
    public openFeatureId = new Subject<string>();
    private _prevFeatureId: string;

    private _tabsLoaded = false;
    private _traceOnTabSelection = false;

    constructor(
        private _cacheService: CacheService,
        private _globalStateService: GlobalStateService,
        private _aiService: AiService,
        private _portalService: PortalService,
        private _translateService: TranslateService,
        private _configService: ConfigService,
        private _storageService: LocalStorageService) {

        this.isStandalone = _configService.isStandalone();
        this.tabsFeature = <EnableTabFeature>Url.getParameterByName(window.location.href, 'appsvc.feature.tabs');

        this.viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
        this.viewInfoStream
            .switchMap(viewInfo => {

                if (this._globalStateService.showTryView) {
                    this._globalStateService.setDisabledMessage(this._translateService.instant(PortalResources.try_appDisabled));
                }

                if (!this._tabsLoaded) {
                    // We only set to false on 1st time load because that's the only time
                    // that we'll update the viewInfoStream, AND call onTabSelected.  Changing
                    // tabs only calls onTabSelected, and clicking on another app will only
                    // update the stream.
                    this._traceOnTabSelection = false;
                }

                viewInfo.data.siteTabRevealedTraceKey = this._aiService.startTrace();
                viewInfo.data.siteTabFullReadyTraceKey = this._aiService.startTrace();

                this._globalStateService.setBusyState();

                return Observable.zip(
                    Observable.of(viewInfo),
                    this._cacheService.getArm(viewInfo.resourceId),
                    (v, s) => ({ viewInfo: v, site: s }));
            })
            .do(null, e => {
                let descriptor = new SiteDescriptor(this.viewInfo.resourceId);
                let message = this._translateService.instant(PortalResources.siteDashboard_getAppError).format(descriptor.site);
                if (e && e.status === 404) {
                    message = this._translateService.instant(PortalResources.siteDashboard_appNotFound).format(descriptor.site);
                }

                this._aiService.trackException(e, "/errors/site-dashboard");

                this._globalStateService.setDisabledMessage(message);
                this._globalStateService.clearBusyState();
            })
            .retry()
            .subscribe(r => {
                this._globalStateService.clearBusyState();
                this.viewInfo = r.viewInfo;

                let site: ArmObj<Site> = r.site.json();
                this.site = site;

                // Is a bit hacky but seems to work well enough in waiting for the tabs to load.
                // AfterContentInit doesn't work and even if it did, it only gets called on the first
                // time the component is loaded.
                setTimeout(() => {
                    let appNode = <AppNode>this.viewInfo.node;
                    if (this.tabs && this.tabs.tabs) {

                        let savedTabInfo = <TabSettings>this._storageService.getItem(LocalStorageKeys.siteTabs);
                        if (appNode.openFunctionSettingsTab) {
                            let tabs = this.tabs.tabs.toArray();
                            let functionTab = tabs.find(t => t.id === SiteTabIds.functionRuntime);
                            if (functionTab) {
                                this.tabs.selectTab(functionTab);
                            }

                            appNode.openFunctionSettingsTab = false;
                        }
                        else if (savedTabInfo) {
                            this.dynamicTabIds = savedTabInfo.dynamicTabIds;
                        }
                    }
                }, 100);
            });
    }

    set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        this.viewInfoStream.next(viewInfo);
    }

    onTabSelected(selectedTab: TabComponent) {

        if (this._traceOnTabSelection) {
            this.viewInfo.data.siteTabRevealedTraceKey = this._aiService.startTrace();
            this.viewInfo.data.siteTabFullReadyTraceKey = this._aiService.startTrace();
        }

        this._tabsLoaded = true;
        this._traceOnTabSelection = true;
        this._prevFeatureId = this.selectedTabId;
        this.selectedTabId = selectedTab.id;

        this.openFeatureId.next(null);
    }

    closeDynamicTab(tab: TabComponent) {
        const tabIndex = this.dynamicTabIds.findIndex(id => id === tab.id);

        if (tabIndex >= 0) {
            this.dynamicTabIds[tabIndex] = null;

            const tabSettings = <TabSettings>{
                id: LocalStorageKeys.siteTabs,
                dynamicTabIds: this.dynamicTabIds
            };

            this._storageService.setItem(LocalStorageKeys.siteTabs, tabSettings);

            if (tab.id === this.selectedTabId) {
                let tabIndexToOpen = -1;
                for (let i = this.dynamicTabIds.length - 1; i > -1; i--) {
                    if (this.dynamicTabIds[i]) {
                        tabIndexToOpen = i;
                        break;
                    }
                }

                if (tabIndexToOpen > -1) {
                    this.tabs.selectTabId(this.dynamicTabIds[tabIndexToOpen]);
                } else {
                    this.tabs.selectTabId(SiteTabIds.features);
                }
            }
        }
    }

    openFeature(featureId: string) {

        if (this.tabsFeature === 'tabs') {
            this._prevFeatureId = this.selectedTabId;

            if (featureId === SiteTabIds.functionRuntime) {
                this.dynamicTabIds[0] = featureId;
            } else if (featureId === SiteTabIds.apiDefinition) {
                this.dynamicTabIds[1] = featureId;
            }

            const tabSettings = <TabSettings>{
                id: LocalStorageKeys.siteTabs,
                dynamicTabIds: this.dynamicTabIds
            };

            this._storageService.setItem(LocalStorageKeys.siteTabs, tabSettings);

            setTimeout(() => {
                this.tabs.selectTabId(featureId);
            }, 100);

        }
        else if (this.tabsFeature === 'inplace') {
            if (featureId) {
                this.tabs.selectTabId(SiteTabIds.features);
            }
            else {
                this.tabs.selectTabId(this._prevFeatureId);
            }

            setTimeout(() => {
                this.openFeatureId.next(featureId);
            }, 100)
        }
        else {
            this.tabs.selectTabId(featureId);
        }
    }

    pinPart() {
        this._portalService.pinPart({
            partSize: PartSize.Normal,
            partInput: {
                id: this.viewInfo.resourceId
            }
        })
    }
}
