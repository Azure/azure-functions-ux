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

    constructor(
        private _cacheService : CacheService,
        private _globalStateService : GlobalStateService
     ) {
        this.viewInfoStream = new Subject<TreeViewInfo>();
        this.viewInfoStream
            .switchMap(viewInfo =>{
                this.viewInfo = viewInfo;
                this._globalStateService.setBusyState();
                return this._cacheService.getArm(viewInfo.resourceId);
            })
            .subscribe(r =>{
                let site : ArmObj<Site> = r.json();
                this._globalStateService.clearBusyState();
                this.site = site;

                // Is a bit hacky but seems to work well enough in waiting for the tabs to load.
                // AfterContentInit doesn't work and even if it did, it only gets called on the first
                // time the component is loaded.
                setTimeout(() =>{
                    let appNode = <AppNode>this.viewInfo.node;
                    if(appNode.openFunctionTab && this.tabs && this.tabs.tabs){
                        let tabs = this.tabs.tabs.toArray();
                        let functionTab = tabs.find(t => t.title === SiteTabNames.functionRuntime);
                        if(functionTab){
                            this.tabs.selectTab(functionTab);
                        }

                        appNode.openFunctionTab = false;
                    }
                },
                100);
            })
    }

    set viewInfoInput(viewInfo : TreeViewInfo){
        this.viewInfoStream.next(viewInfo);
    }

    onTabSelected(selectedTab: TabComponent) {
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