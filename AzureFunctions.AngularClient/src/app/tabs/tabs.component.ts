import { BusyStateComponent } from './../busy-state/busy-state.component';
import { AiService } from './../shared/services/ai.service';
import { Component, ContentChildren, QueryList, AfterContentInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { TabComponent } from '../tab/tab.component';
import { PortalService } from '../shared/services/portal.service';

@Component({
    selector: 'tabs',
    templateUrl: './tabs.component.html'
})
export class TabsComponent implements AfterContentInit {

    @ViewChild(BusyStateComponent) busyState : BusyStateComponent;
    @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;
    @Output() tabSelected = new EventEmitter<TabComponent>();
    @Output() tabClosed = new EventEmitter<TabComponent>();

    constructor(
        private _portalService: PortalService,
        private _aiService : AiService) {
    }

    ngAfterContentInit() {
        let activeTabs = this.tabs.filter((tab) => tab.active);

        if (activeTabs.length === 0) {
            this.selectTabHelper(this.tabs.first);
        }
    }

    selectTab(tab: TabComponent) {
        this._aiService.trackEvent("/sites/open-tab", { name : tab.id });
        this.selectTabHelper(tab);
    }

    closeTab(tab: TabComponent) {
        this.tabClosed.emit(tab);
        let tabs = this.tabs.toArray();
        if(tabs.length > 2){
            this.selectTabHelper(tabs[tabs.length - 2]);
        }
        else if(tabs.length > 1){
            this.selectTabHelper(tabs[0]);
        }
    }

    selectTabHelper(tab: TabComponent) {

        this.tabs.toArray().forEach(t => t.active = false);
        if (tab) {
            tab.active = true;
            this.tabSelected.emit(tab);
        }
    }
}