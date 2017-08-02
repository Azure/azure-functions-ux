import { SiteConfigComponent } from './../site-config/site-config.component';
import { DirtyStateEvent } from './../../shared/models/broadcast-event';
import { SiteConfigStandaloneComponent } from './../site-config-standalone/site-config-standalone.component';
import { SwaggerDefinitionComponent } from './../swagger-definition/swagger-definition.component';
import { FunctionRuntimeComponent } from './../function-runtime/function-runtime.component';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BroadcastService } from './../../shared/services/broadcast.service';
import { SiteManageComponent } from './../site-manage/site-manage.component';
import { TabInfo } from './../../controls/tabs/tab/tab-info';
import { SiteSummaryComponent } from './../site-summary/site-summary.component';
import { SiteData } from './../../tree-view/models/tree-view-info';
import { Component, SimpleChange, OnChanges, OnDestroy, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';

import { ConfigService } from './../../shared/services/config.service';
import { PortalService } from './../../shared/services/portal.service';
import { PortalResources } from './../../shared/models/portal-resources';
import { AiService } from './../../shared/services/ai.service';
import { SiteTabIds } from './../../shared/models/constants';
import { AppNode } from './../../tree-view/app-node';
import { CacheService } from '../../shared/services/cache.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { SiteDescriptor } from '../../shared/resourceDescriptors';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Site } from '../../shared/models/arm/site';
import { PartSize } from '../../shared/models/portal';

@Component({
    selector: 'site-dashboard',
    templateUrl: './site-dashboard.component.html',
    styleUrls: ['./site-dashboard.component.scss'],
})

export class SiteDashboardComponent implements OnChanges, OnDestroy {

    // We keep a static copy of all the tabs that are open becuase we want to reopen them
    // if a user changes apps or navigates away and comes back.  But we also create an instance
    // copy because the template can't reference static properties
    private static _tabInfos: TabInfo[] = [];
    public tabInfos: TabInfo[] = SiteDashboardComponent._tabInfos;

    @Input() viewInfo: TreeViewInfo<SiteData>;

    public dynamicTabIds: (string | null)[] = [null, null];
    public site: ArmObj<Site>;
    public viewInfoStream: Subject<TreeViewInfo<SiteData>>;
    public TabIds = SiteTabIds;
    public Resources = PortalResources;
    public isStandalone = false;

    private _currentTabId: string;
    private _prevTabId: string;

    private _tabsLoaded = false;
    private _openTabSubscription: RxSubscription;
    private _dirtySub: RxSubscription;

    constructor(
        private _cacheService: CacheService,
        private _globalStateService: GlobalStateService,
        private _aiService: AiService,
        private _portalService: PortalService,
        private _translateService: TranslateService,
        private _configService: ConfigService,
        private _broadcastService: BroadcastService) {

        this.isStandalone = this._configService.isStandalone();

        this._openTabSubscription = this._broadcastService.subscribe<string>(BroadcastEvent.OpenTab, tabId => {
            this.openFeature(tabId);
        });

        this._dirtySub = this._broadcastService.subscribe<DirtyStateEvent>(BroadcastEvent.DirtyStateChange, event => {
            if (!event.dirty && !event.reason) {
                this.tabInfos.forEach(t => t.dirty = false);
            } else {
                const info = this.tabInfos.find(t => t.id === event.reason);
                if (info) {
                    info.dirty = event.dirty;
                }
            }
        });

        if (this.tabInfos.length === 0) {

            // Setup initial tabs without inputs immediate so that they load right away
            this.tabInfos = [this._getTabInfo(SiteTabIds.overview, true /* active */, null)];

            if (this.isStandalone) {
                this.tabInfos.push(this._getTabInfo(SiteTabIds.config, false /* active */, null));
            } else {
                this.tabInfos.push(this._getTabInfo(SiteTabIds.features, false /* active */, null));
            }
        }

        const activeTab = this.tabInfos.find(info => info.active);
        if (activeTab) {
            this._currentTabId = activeTab.id;
        }

        this.viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
        this.viewInfoStream
            .switchMap(viewInfo => {

                if (this._globalStateService.showTryView) {
                    this._globalStateService.setDisabledMessage(this._translateService.instant(PortalResources.try_appDisabled));
                }

                viewInfo.data.siteTabRevealedTraceKey = this._aiService.startTrace();
                viewInfo.data.siteTabFullReadyTraceKey = this._aiService.startTrace();

                this._globalStateService.setBusyState();

                return this._cacheService.getArm(viewInfo.resourceId);
            })
            .do(null, e => {
                const descriptor = new SiteDescriptor(this.viewInfo.resourceId);
                let message = this._translateService.instant(PortalResources.siteDashboard_getAppError).format(descriptor.site);
                if (e && e.status === 404) {
                    message = this._translateService.instant(PortalResources.siteDashboard_appNotFound).format(descriptor.site);
                }

                this._aiService.trackException(e, '/errors/site-dashboard');

                this._globalStateService.setDisabledMessage(message);
                this._globalStateService.clearBusyState();
            })
            .retry()
            .subscribe(r => {

                this._broadcastService.clearAllDirtyStates();

                for (let i = 0; i < this.tabInfos.length; i++) {
                    const info = this.tabInfos[i];

                    if (info.active) {
                        // We're not recreating the active tab so that it doesn't flash in the UI
                        this.tabInfos[i].componentInput = { viewInfoInput: this.viewInfo };
                    } else {

                        // Just to be extra safe, we create new component instances for tabs that
                        // aren't visible to be sure that we can't accidentally load them with the wrong
                        // input in the future.  This also helps to dispose of other unused components
                        // when we switch apps.
                        this.tabInfos[i] = this._getTabInfo(info.id, false /* active */, { viewInfoInput: this.viewInfo });
                    }
                }

                this._globalStateService.clearBusyState();

                const site: ArmObj<Site> = r.json();
                this.site = site;

                const appNode = <AppNode>this.viewInfo.node;
                if (appNode.openTabId) {
                    this.openFeature(appNode.openTabId);
                    appNode.openTabId = null;
                }
            });
    }

    ngOnDestroy() {
        if (this._openTabSubscription) {
            this._openTabSubscription.unsubscribe();
        }

        if (this._dirtySub) {
            this._dirtySub.unsubscribe();
        }

        // Save current set of tabs
        SiteDashboardComponent._tabInfos = this.tabInfos;
    }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (changes['viewInfo']) {
            this.viewInfoStream.next(this.viewInfo);
        }
    }

    private _selectTabId(id: string) {
        this.selectTab(this.tabInfos.find(i => i.id === id));
    }

    selectTab(info: TabInfo) {
        this._aiService.trackEvent('/sites/open-tab', { name: info.id });
        this.tabInfos.forEach(t => t.active = t.id === info.id);

        this.viewInfo.data.siteTabRevealedTraceKey = this._aiService.startTrace();
        this.viewInfo.data.siteTabFullReadyTraceKey = this._aiService.startTrace();

        this._prevTabId = this._currentTabId;
        this._tabsLoaded = true;
        this._currentTabId = info.id;
    }

    closeTab(info: TabInfo) {
        const tabIndexToClose = this.tabInfos.findIndex(i => i.id === info.id);
        if (tabIndexToClose >= 0) {
            this.tabInfos.splice(tabIndexToClose, 1);

            // Only need to worry about opening a new tab if the tab being closed is the current one.
            if (info.id === this._currentTabId) {
                if (this._prevTabId) {
                    this._selectTabId(this._prevTabId);
                } else {
                    this._selectTabId(SiteTabIds.overview);
                }
            }

            // If you close the previous tab, then this will make sure that you don't go back to it
            // if you close the current tab.
            if (info.id === this._prevTabId) {
                this._prevTabId = null;
            }
        }
    }

    openFeature(featureId: string) {

        this._prevTabId = this._currentTabId;
        let tabInfo = this.tabInfos.find(t => t.id === featureId);

        if (!tabInfo) {
            tabInfo = this._getTabInfo(featureId, true /* active */, { viewInfoInput: this.viewInfo });
            this.tabInfos.push(tabInfo);
        }

        this.selectTab(tabInfo);
    }

    pinPart() {
        this._portalService.pinPart({
            partSize: PartSize.Normal,
            partInput: {
                id: this.viewInfo.resourceId
            }
        });
    }

    private _getTabInfo(tabId: string, active: boolean, input: { viewInfoInput: TreeViewInfo<SiteData> }): TabInfo {
        const info = {
            title: '',
            id: tabId,
            active: active,
            closeable: true,
            iconUrl: null,
            dirty: false,
            componentFactory: null,
            componentInput: input ? input : {}
        };

        switch (tabId) {
            case SiteTabIds.overview:
                info.title = this._translateService.instant(PortalResources.tab_overview);
                info.componentFactory = SiteSummaryComponent;
                info.closeable = false;
                break;

            case SiteTabIds.features:
                info.title = this._translateService.instant(PortalResources.tab_features);
                info.componentFactory = SiteManageComponent;
                info.closeable = false;
                break;

            case SiteTabIds.functionRuntime:
                info.title = this._translateService.instant(PortalResources.tab_functionSettings);
                info.iconUrl = 'images/Functions.svg';
                info.componentFactory = FunctionRuntimeComponent;
                break;

            case SiteTabIds.apiDefinition:
                info.title = this._translateService.instant(PortalResources.tab_api_definition);
                info.iconUrl = 'images/api-definition.svg';
                info.componentFactory = SwaggerDefinitionComponent;
                break;

            case SiteTabIds.config:
                info.title = this._translateService.instant(PortalResources.tab_configuration);
                info.componentFactory = SiteConfigStandaloneComponent;
                info.closeable = false;
                break;

            case SiteTabIds.applicationSettings:
                info.title = this._translateService.instant(PortalResources.tab_applicationSettings);
                info.iconUrl = 'images/application-settings.svg';
                info.componentFactory = SiteConfigComponent;
                info.closeable = true;
                break;
        }

        return info;
    }
}
