import { AiService } from './../shared/services/ai.service';
import { Component, ContentChildren, QueryList, AfterContentInit, Output, EventEmitter } from '@angular/core';
import { TabComponent } from '../tab/tab.component';
import { PortalService } from '../shared/services/portal.service';

@Component({
    selector: 'tabs',
    styleUrls: ['./tabs.component.scss'],
    templateUrl: './tabs.component.html'
})
export class TabsComponent implements AfterContentInit {

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
        this._aiService.trackEvent("/sites/open-tab", { name : tab.title });
        this.selectTabHelper(tab);
    }

    closeTab(tab: TabComponent) {
        this.tabClosed.emit(tab);
        this.selectTabHelper(this.tabs.toArray()[0]);
    }

    selectTabHelper(tab: TabComponent) {

        this.tabs.toArray().forEach(tab => tab.active = false);
        tab.active = true;
        this.tabSelected.emit(tab);
    }
}