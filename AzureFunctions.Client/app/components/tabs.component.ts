import { Component, ContentChildren, QueryList, AfterContentInit, Output, EventEmitter } from 'angular2/core';
import { TabComponent } from './tab.component';

@Component({
    selector: 'tabs',
    styleUrls: ['styles/tabs.style.css'],
    templateUrl: 'templates/tabs.component.html'
})
export class TabsComponent implements AfterContentInit {

    @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;
    @Output() tabSelected = new EventEmitter<TabComponent>();

    ngAfterContentInit() {
        let activeTabs = this.tabs.filter((tab) => tab.active);

        if (activeTabs.length === 0) {
            this.selectTab(this.tabs.first);
        }
    }

    selectTab(tab: TabComponent) {        
        this.tabs.toArray().forEach(tab => tab.active = false);
        tab.active = true;
        this.tabSelected.emit(tab);
    }

}