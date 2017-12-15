import { BroadcastService } from './../../shared/services/broadcast.service';
import { Observable } from 'rxjs/Observable';
import { CacheService } from './../../shared/services/cache.service';
import { Subject } from 'rxjs/Subject';
import { FunctionApp } from 'app/shared/function-app';
import { Component, Output, OnInit, Input, OnDestroy } from '@angular/core';
import { ArmService } from 'app/shared/services/arm.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';

@Component({
  selector: 'bottom-tabs',
  templateUrl: './bottom-tabs.component.html',
  styleUrls: ['./bottom-tabs.component.scss']
})
export class BottomTabsComponent implements OnInit, OnDestroy {
  @Input() resourceId: string;
  @Output() onExpanded = new Subject<boolean>();

  public functionApp: FunctionApp = null;
  public expanded = false;
  public logContent = '';
  public isPolling = false;

  private _stopPolling = new Subject();
  private _ngUnsubscribe = new Subject();
  private _totalPollingDuration = 300000;
  private _pollingInterval = 5000;

  constructor(
    private _cacheService: CacheService,
    private _armService: ArmService,
    private _broadcastService: BroadcastService
  ) {
    this._broadcastService.getEvents(BroadcastEvent.StartPollingFunctionLogs)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(_ => {
        this.startLogs();
      });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
    this.onExpanded.next(this.expanded);
  }

  startLogs() {
    // This should never get called while already polling but just being sure
    if (this.isPolling) {
      return;
    }

    if(!this.expanded){
      this.toggleExpanded();
    }

    this.isPolling = true;

    // TODO: need to be polling on `${this.mainSiteUrl}/admin/host/status` to keep logging

    Observable.of(null)
      .delay(this._totalPollingDuration)
      .takeUntil(this._stopPolling)
      .subscribe(_ => {
        this.stopLogs();
      });

    Observable.timer(0, this._pollingInterval)
      .takeUntil(this._stopPolling)
      .switchMap(t => {
        return this._cacheService.getArm(`${this.resourceId}/logs`, true);
      })
      .switchMap(r => {
        const files: any[] = r.json();
        if (files.length > 0) {

          files
            .map(e => { e.parsedTime = new Date(e.m_time); return e; })
            .sort((a, b) => a.parsedTime.getTime() - b.parsedTime.getTime());

          const headers = this._armService.getHeaders();
          headers.append('Range', `bytes=-${10000}`);
          const url = this._armService.getArmUrl(this.resourceId);
          return this._cacheService.get(`${url}/logs/${files.pop().name}`, true, headers);
        } else {
          return Observable.of(null);
        }
      })
      .subscribe(r => {
        if (r) {
          this.logContent = r.text();
        } else {
          this.logContent = `No logs to display`;
        }

      }, err => {
        // TODO: how to handle error?
        this.logContent = `Failed to download log content - ${err.text()}`;
      });
  }

  stopLogs() {
    this.logContent += 'Logging paused';
    this._stopPolling.next();
    this.isPolling = false;
  }

  clearLogs() {
    this.logContent = '';
  }
}
