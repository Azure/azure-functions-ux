import { Subject } from 'rxjs/Subject';
import { Component, Output, OnInit, Input, OnDestroy, ContentChild } from '@angular/core';
import { BottomTabComponent } from 'app/controls/bottom-tabs/bottom-tab.component';
import { EmbeddedFunctionLogsTabComponent } from 'app/function/embedded/embedded-function-logs-tab/embedded-function-logs-tab.component';

export interface BottomTabCommand {
  iconUrl: string;
  text: string;
  click: () => void;
}

export interface BottomTab {
  commands: BottomTabCommand[];
}

@Component({
  selector: 'bottom-tabs',
  templateUrl: './bottom-tabs.component.html',
  styleUrls: ['./bottom-tabs.component.scss']
})
export class BottomTabsComponent implements OnInit, OnDestroy {
  @Input() resourceId: string;
  @Output() onExpanded = new Subject<boolean>();

  // Bottom tabs for the function editor doesn't follow normal tab conventions because it
  // also has commands that show up on-top.  There wasn't a clean way to get this behavior
  // using a generic parent "tab" component, so the pattern here is to just detect individual
  // child tab components.  When there's more than one tab type, we can just manually compose them
  // into an array.
  @ContentChild(EmbeddedFunctionLogsTabComponent) logsTab: EmbeddedFunctionLogsTabComponent;

  public activeTab: BottomTabComponent;

  public expanded = false;

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  toggleExpanded() {

    this.expanded = !this.expanded;
    this.onExpanded.next(this.expanded);

    this.activeTab = this.expanded ? this.logsTab : null; // For now we only have one tab so just hardcoding
  }
}
