import { TabComponent } from './../tabs/tab/tab.component';
import { Subject } from 'rxjs/Subject';
import { Component, OnInit, AfterContentInit, Output, ContentChildren, QueryList } from '@angular/core';

@Component({
  selector: 'right-tabs',
  templateUrl: './right-tabs.component.html',
  styleUrls: ['./right-tabs.component.scss']
})
export class RightTabsComponent implements OnInit, AfterContentInit {

  @Output() onExpanded = new Subject<boolean>();
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;
  public expanded = false;

  constructor() {

  }

  ngOnInit() {
  }

  toggleExpanded() {
    const tabs = this.tabs.toArray();
    if (tabs.length > 0) {
      tabs[0].active = !tabs[0].active;  // For now we only have one tab so just hardcoding
    }

    this.expanded = !this.expanded;
    this.onExpanded.next(this.expanded);
  }

  ngAfterContentInit() {
    // this.onResize();
  }
}
