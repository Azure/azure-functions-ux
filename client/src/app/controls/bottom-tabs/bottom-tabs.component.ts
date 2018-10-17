import { BroadcastEvent } from './../../shared/models/broadcast-event';
import { BottomTabEvent } from './bottom-tab-event';
import { Subject } from 'rxjs/Subject';
import { Component, Output, Input, OnDestroy, ContentChild } from '@angular/core';
import { BottomTabComponent } from 'app/controls/bottom-tabs/bottom-tab.component';
import { EmbeddedFunctionLogsTabComponent } from 'app/function/embedded/embedded-function-logs-tab/embedded-function-logs-tab.component';
import { BroadcastService } from 'app/shared/services/broadcast.service';

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
  styleUrls: ['./bottom-tabs.component.scss'],
})
export class BottomTabsComponent implements OnDestroy {
  @Input()
  resourceId: string;
  @Output()
  onExpanded = new Subject<boolean>();

  // Bottom tabs for the function editor doesn't follow normal tab conventions because it
  // also has commands that show up on-top.  There wasn't a clean way to get this behavior
  // using a generic parent "tab" component, so the pattern here is to just detect individual
  // child tab components.  When there's more than one tab type, we can just manually compose them
  // into an array.
  @ContentChild(EmbeddedFunctionLogsTabComponent)
  logsTab: EmbeddedFunctionLogsTabComponent;

  public activeTab: BottomTabComponent;
  public expanded = false;

  private _ngUnsubscribe = new Subject();

  constructor(private _broadcastService: BroadcastService) {
    this._broadcastService
      .getEvents<BottomTabEvent<boolean>>(BroadcastEvent.BottomTabsEvent)
      .takeUntil(this._ngUnsubscribe)
      .filter(e => e.type === 'isExpanded')
      .subscribe(e => {
        this.setTabState(e.value);
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }

  toggleExpanded() {
    this.setTabState(!this.expanded);
  }

  setTabState(expanded: boolean) {
    this.expanded = expanded;
    this.onExpanded.next(this.expanded);

    setTimeout(() => {
      this.activeTab = this.expanded ? this.logsTab : null; // For now we only have one tab so just hardcoding
    });
  }
}
