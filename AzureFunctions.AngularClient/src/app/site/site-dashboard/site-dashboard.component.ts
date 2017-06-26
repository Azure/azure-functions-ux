import { LocalStorageService } from './../../shared/services/local-storage.service';
import { Component, OnInit, EventEmitter, Input, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
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
import { SiteTabIds, LocalStorageKeys } from './../../shared/models/constants';
import { AppNode } from './../../tree-view/app-node';
import {TabsComponent} from '../../tabs/tabs.component';
import {TabComponent} from '../../tab/tab.component';
import {CacheService} from '../../shared/services/cache.service';
import {GlobalStateService} from '../../shared/services/global-state.service';
import {TreeViewInfo} from '../../tree-view/models/tree-view-info';
import {DashboardType} from '../../tree-view/models/dashboard-type';
import {Descriptor, SiteDescriptor} from '../../shared/resourceDescriptors';
import {ArmObj} from '../../shared/models/arm/arm-obj';
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
    @ViewChild(TabsComponent) tabs : TabsComponent;

    public selectedTabId: string = SiteTabIds.overview;
    public dynamicTabId: string = null;
    public site : ArmObj<Site>;
    public viewInfoStream : Subject<TreeViewInfo>;
    public viewInfo : TreeViewInfo;
    public TabIds = SiteTabIds;
    public Resources = PortalResources;
    public isStandalone = false;

    private _tabsLoaded = false;
    private _traceOnTabSelection = false;

    constructor(
        private _cacheService : CacheService,
        private _globalStateService : GlobalStateService,
        private _aiService : AiService,
        private _portalService: PortalService,
        private _translateService : TranslateService,
        private _configService : ConfigService,
        private _storageService : LocalStorageService) {

        this.isStandalone = _configService.isStandalone();

        this.viewInfoStream = new Subject<TreeViewInfo>();
        this.viewInfoStream
            .switchMap(viewInfo =>{

                if(this._globalStateService.showTryView){
                    this._globalStateService.setDisabledMessage(this._translateService.instant(PortalResources.try_appDisabled));
                }

                if(!this._tabsLoaded){
                    // We only set to false on 1st time load because that's the only time
                    // that we'll update the viewInfoStream, AND call onTabSelected.  Changing
                    // tabs only calls onTabSelected, and clicking on another app will only
                    // update the stream.
                    this._traceOnTabSelection = false;
                }

                viewInfo.data.siteTraceKey = this._aiService.startTrace();

                this._globalStateService.setBusyState();

                return Observable.zip(
                    Observable.of(viewInfo),
                    this._cacheService.getArm(viewInfo.resourceId),
                    (v, s) => ({ viewInfo : v, site : s}));
            })
            .do(null, e =>{
                let descriptor = new SiteDescriptor(this.viewInfo.resourceId);
                let message = this._translateService.instant(PortalResources.siteDashboard_getAppError).format(descriptor.site);
                if(e && e.status === 404){
                    message = this._translateService.instant(PortalResources.siteDashboard_appNotFound).format(descriptor.site);
                }

                this._aiService.trackException(e, "/errors/site-dashboard");

                this._globalStateService.setDisabledMessage(message);
                this._globalStateService.clearBusyState();
            })
            .retry()
            .subscribe(r =>{
                this._globalStateService.clearBusyState();
                this.viewInfo = r.viewInfo;

                let site : ArmObj<Site> = r.site.json();
                this.site = site;

                // Is a bit hacky but seems to work well enough in waiting for the tabs to load.
                // AfterContentInit doesn't work and even if it did, it only gets called on the first
                // time the component is loaded.
                setTimeout(() =>{
                    let appNode = <AppNode>this.viewInfo.node;
                    if(this.tabs && this.tabs.tabs){

                        let savedTabInfo = <TabSettings> this._storageService.getItem(LocalStorageKeys.siteTabs);
                        if(appNode.openFunctionSettingsTab){
                            let tabs = this.tabs.tabs.toArray();
                            let functionTab = tabs.find(t => t.title === SiteTabIds.functionRuntime);
                            if(functionTab){
                                this.tabs.selectTab(functionTab);
                            }

                            appNode.openFunctionSettingsTab = false;
                        }
                        else if(savedTabInfo){
                            this.dynamicTabId = savedTabInfo.dynamicTabId;
                        }
                    }
                },
                100);
            });
    }

    set viewInfoInput(viewInfo : TreeViewInfo){
        this.viewInfoStream.next(viewInfo);
    }

    onTabSelected(selectedTab: TabComponent) {

        if(this._traceOnTabSelection){
            this.viewInfo.data.siteTraceKey = this._aiService.startTrace();
        }

        this._tabsLoaded = true;
        this._traceOnTabSelection = true;
        this.selectedTabId = selectedTab.id;
    }

    closeDynamicTab(tabId : string){
        this.dynamicTabId = null;
        this._storageService.removeItem(LocalStorageKeys.siteTabs);
    }

    openDynamicTab(tabId : string){
        this.dynamicTabId = tabId;

        setTimeout(() =>{
            let tabs = this.tabs.tabs.toArray();
            this.tabs.selectTab(tabs[tabs.length-1]);
        }, 100);

        let tabSettings = <TabSettings>{
            id : LocalStorageKeys.siteTabs,
            dynamicTabId : this.dynamicTabId
        };

        this._storageService.setItem(LocalStorageKeys.siteTabs, tabSettings);
    }

    pinPart(){
        this._portalService.pinPart({
            partSize : PartSize.Normal,
            partInput : {
                id : this.viewInfo.resourceId
            }
        })
    }
}
