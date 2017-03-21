import { PortalResources } from './../../shared/models/portal-resources';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AiService } from './../../shared/services/ai.service';
import { SiteTabNames } from './../../shared/models/constants';
import { AppNode } from './../../tree-view/app-node';
import { Component, OnInit, EventEmitter, Input, ViewChild } from '@angular/core';
import {Observable, Subject} from 'rxjs/Rx';
import {TabsComponent} from '../../tabs/tabs.component';
import {TabComponent} from '../../tab/tab.component';
import {CacheService} from '../../shared/services/cache.service';
import {GlobalStateService} from '../../shared/services/global-state.service';
import {TreeViewInfo} from '../../tree-view/models/tree-view-info';
import {DashboardType} from '../../tree-view/models/dashboard-type';
import {Descriptor, SiteDescriptor} from '../../shared/resourceDescriptors';
import {ArmObj} from '../../shared/models/arm/arm-obj';
import {Site} from '../../shared/models/arm/site';

@Component({
    selector: 'site-dashboard',
    templateUrl: './site-dashboard.component.html',
    styleUrls: ['./site-dashboard.component.scss'],
    inputs: ['viewInfoInput']
})

export class SiteDashboardComponent {
    public selectedTabTitle: string = SiteTabNames.overview;
    public site : ArmObj<Site>;
    public viewInfoStream : Subject<TreeViewInfo>;
    public viewInfo : TreeViewInfo;
    @ViewChild(TabsComponent) tabs : TabsComponent;

    public TabNames = SiteTabNames;

    public activeComponent = "";

    private _tabsLoaded = false;
    private _traceOnTabSelection = false;

    constructor(
        private _cacheService : CacheService,
        private _globalStateService : GlobalStateService,
        private _aiService : AiService,
        private _translateService : TranslateService) {

        this.viewInfoStream = new Subject<TreeViewInfo>();
        this.viewInfoStream
            .switchMap(viewInfo =>{
                
                if(!this._tabsLoaded){
                    // We only set to false on 1st time load because that's the only time
                    // that we'll update the viewInfoStream, AND call onTabSelected.  Changing
                    // tabs only calls onTabSelected, and clicking on another app will only
                    // update the stream.
                    this._traceOnTabSelection = false;
                }

                viewInfo.data.siteTraceKey = this._aiService.startTrace();

                this.viewInfo = viewInfo;
                this._globalStateService.setBusyState();

                return this._cacheService.getArm(viewInfo.resourceId)
            })
            .do(null, e =>{
                let descriptor = new SiteDescriptor(this.viewInfo.resourceId);                
                let message = this._translateService.instant(PortalResources.siteDashboard_getAppError).format(descriptor.site);
                if(e && e.status === 404){
                    message = this._translateService.instant(PortalResources.siteDashboard_appNotFound).format(descriptor.site);
                }

                this._globalStateService.setDisabledMessage(message);
                this._globalStateService.clearBusyState();
            })
            .retry()
            .subscribe(r =>{
                this._globalStateService.clearBusyState();

                let site : ArmObj<Site> = r.json();
                this.site = site;

                // Is a bit hacky but seems to work well enough in waiting for the tabs to load.
                // AfterContentInit doesn't work and even if it did, it only gets called on the first
                // time the component is loaded.
                setTimeout(() =>{
                    let appNode = <AppNode>this.viewInfo.node;
                    if(appNode.openFunctionSettingsTab && this.tabs && this.tabs.tabs){
                        let tabs = this.tabs.tabs.toArray();
                        let functionTab = tabs.find(t => t.title === SiteTabNames.functionRuntime);
                        if(functionTab){
                            this.tabs.selectTab(functionTab);
                        }

                        appNode.openFunctionSettingsTab = false;
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
        this.selectedTabTitle = selectedTab.title;
    }

    onTabClosed(closedTab: TabComponent){
        // For now only support a single dynamic tab
        this.activeComponent = "";
    }

    openTab(component : string){
        this.activeComponent = component;
        
        setTimeout(() =>{
            let tabs = this.tabs.tabs.toArray();
            this.tabs.selectTab(tabs[tabs.length-1]);
        }, 100);
    }
}