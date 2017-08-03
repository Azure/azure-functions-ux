import { BusyStateComponent } from './../busy-state/busy-state.component';
import { AiService } from './../shared/services/ai.service';
import { Component, ContentChildren, QueryList, AfterContentInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { TabComponent } from '../tab/tab.component';

@Component({
    selector: 'tabs',
    templateUrl: './tabs.component.html'
})
export class TabsComponent implements AfterContentInit {

    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;
    @Output() tabSelected = new EventEmitter<TabComponent>();
    @Output() tabClosed = new EventEmitter<TabComponent>();

    constructor(private _aiService: AiService) {
    }

    ngAfterContentInit() {
        const activeTabs = this.tabs.filter((tab) => tab.active);

        if (activeTabs.length === 0) {
            this.selectTabHelper(this.tabs.first);
        }
    }

    selectTabId(tabId: string) {
        const tabs = this.tabs.toArray();
        const tab = tabs.find(t => t.id === tabId);
        if (tab) {
            this.selectTab(tab);
        }
    }

    selectTab(tab: TabComponent) {
        this._aiService.trackEvent('/sites/open-tab', { name: tab.id });
        this.selectTabHelper(tab);
    }

    closeTab(tab: TabComponent) {
        this.tabClosed.emit(tab);
    }

    selectTabHelper(tab: TabComponent) {

        this.tabs.toArray().forEach(t => t.active = false);
        if (tab) {
            tab.active = true;
            this.tabSelected.emit(tab);
        }
    }
}