import { Component, ContentChildren, QueryList, AfterContentInit, Output, EventEmitter } from 'angular2/core';
import { TabComponent } from './tab.component';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';
import {PortalService} from '../services/portal.service';
import {TutorialEvent, TutorialStep} from '../models/tutorial';
import {TabNames} from '../constants';

@Component({
    selector: 'tabs',
    styleUrls: ['styles/tabs.style.css'],
    templateUrl: 'templates/tabs.component.html'
})
export class TabsComponent implements AfterContentInit {

    @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;
    @Output() tabSelected = new EventEmitter<TabComponent>();

    constructor(private _broadcastService: IBroadcastService, private _portalService : PortalService){

        this._broadcastService.subscribe<TutorialEvent>(BroadcastEvent.TutorialStep, event => {
            
            let selectedTab: TabComponent;
            switch(event.step){
                case TutorialStep.Develop:
                case TutorialStep.NextSteps:
                    selectedTab = this.tabs.toArray().find(tab => tab.title === TabNames.develop);
                    break;
                case TutorialStep.Integrate:
                    selectedTab = this.tabs.toArray().find(tab => tab.title === TabNames.integrate);
                    break;
                case TutorialStep.Manage:
                    selectedTab = this.tabs.toArray().find(tab => tab.title === TabNames.manage);
                    break;
                default:
                    break;
            }

            if (selectedTab) {
                this.selectTabHelper(selectedTab, false);
            }
        });
    }

    ngAfterContentInit() {
        let activeTabs = this.tabs.filter((tab) => tab.active);

        if (activeTabs.length === 0) {
            this.selectTabHelper(this.tabs.first, false);
        }

        this._broadcastService.broadcast<TutorialEvent>(
            BroadcastEvent.TutorialStep,
            {
               functionInfo: null,
               step: TutorialStep.Develop
           });
    }


    selectTab(tab: TabComponent) {
        this.selectTabHelper(tab, true);
    }

    selectTabHelper(tab: TabComponent, logClick: boolean) {
        if (logClick) {
            this._portalService.logAction("tabs", "click develop", null);
        }

        this.tabs.toArray().forEach(tab => tab.active = false);
        tab.active = true;
        this.tabSelected.emit(tab);

    }
}