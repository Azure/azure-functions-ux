import { Component, ContentChildren, QueryList, AfterContentInit, Output, EventEmitter } from 'angular2/core';
import { TabComponent } from './tab.component';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';
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

    constructor(private _broadcastService: IBroadcastService){

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
                this.selectTab(selectedTab);
            }
        });
    }

    ngAfterContentInit() {
        let activeTabs = this.tabs.filter((tab) => tab.active);

        if (activeTabs.length === 0) {
            this.selectTab(this.tabs.first);
        }

        this._broadcastService.broadcast<TutorialEvent>(
            BroadcastEvent.TutorialStep,
            {
               functionInfo: null,
               step: TutorialStep.Develop
           });
    }

    selectTab(tab: TabComponent) {
        this.tabs.toArray().forEach(tab => tab.active = false);
        tab.active = true;
        this.tabSelected.emit(tab);
    }
}