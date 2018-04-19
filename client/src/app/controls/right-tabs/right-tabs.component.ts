import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { RightTabEvent } from './right-tab-event';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { TabComponent } from './../tabs/tab/tab.component';
import { Component, OnInit, AfterContentInit, ContentChildren, QueryList } from '@angular/core';

@Component({
  selector: 'right-tabs',
  templateUrl: './right-tabs.component.html'
})
export class RightTabsComponent implements OnInit, AfterContentInit {

  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;
  public expanded = false;

  constructor(private _broadcastService: BroadcastService) {

  }

  ngOnInit() {
  }

  toggleExpanded() {
    const tabs = this.tabs.toArray();
    if (tabs.length > 0) {
      tabs[0].active = !tabs[0].active;  // For now we only have one tab so just hardcoding
    }

    this.expanded = !this.expanded;
    this._broadcastService.broadcastEvent<RightTabEvent<boolean>>(BroadcastEvent.RightTabsEvent, {
      type: 'isExpanded',
      value: this.expanded
    });
  }

  ngAfterContentInit() {
  }
}
