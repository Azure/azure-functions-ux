import { ContentChildren, QueryList, AfterContentInit, Component, ViewEncapsulation } from '@angular/core';
import { TabComponent } from 'app/controls/tabs/tab/tab.component';

@Component({
    selector: 'tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TabsComponent implements AfterContentInit {

    @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

    constructor() {
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
        this.selectTabHelper(tab);
    }

    selectTabHelper(tab: TabComponent) {

        this.tabs.toArray().forEach(t => t.active = false);
        if (tab) {
            tab.active = true;
        }
    }
}