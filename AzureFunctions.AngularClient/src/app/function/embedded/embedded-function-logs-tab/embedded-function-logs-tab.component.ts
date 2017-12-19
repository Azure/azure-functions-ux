import { BroadcastEvent } from './../../../shared/models/broadcast-event';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BottomTabComponent } from './../../../controls/bottom-tabs/bottom-tab.component';
import { ArmService } from './../../../shared/services/arm.service';
import { Observable } from 'rxjs/Observable';
// import { BottomTab } from './../../../controls/bottom-tabs/bottom-tabs.component';
import { CacheService } from './../../../shared/services/cache.service';
import { Subject } from 'rxjs/Subject';
import { Component, OnInit, AfterContentInit, Input, OnChanges, SimpleChange, OnDestroy } from '@angular/core';
import { FunctionEditorEvent } from 'app/function/embedded/function-editor-event';

@Component({
  selector: 'embedded-function-logs-tab',
  templateUrl: './embedded-function-logs-tab.component.html',
  styleUrls: ['./embedded-function-logs-tab.component.scss']
})
export class EmbeddedFunctionLogsTabComponent extends BottomTabComponent implements OnInit, AfterContentInit, OnChanges, OnDestroy {
  @Input() resourceId: string;

  public commands = [{
    iconUrl: 'image/start.svg',
    text: 'Pause',
    click: () => this._startLogs()
  }];

  public logContent = '';
  public isPolling = false;

  private _stopPolling = new Subject();
  private _ngUnsubscribe = new Subject();
  private _totalPollingDuration = 300000;
  private _pollingInterval = 5000;

  private _resourceIdStream = new Subject<string>();

  constructor(private _cacheService: CacheService, private _armService: ArmService, private _broadcastService: BroadcastService) {
    super();

    this._resourceIdStream
      .takeUntil(this._ngUnsubscribe)
      .distinctUntilChanged()
      .subscribe(r => {
        this._startLogs();
      });

    this._broadcastService.getEvents<FunctionEditorEvent<void>>(BroadcastEvent.FunctionEditorEvent)
      .filter(e => e.type === 'runTest')
      .takeUntil(this._ngUnsubscribe)
      .subscribe(r => {
        this._startLogs();
      });
  }

  ngOnInit() {
  }

  ngAfterContentInit() {
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (changes['resourceId']) {
      this._resourceIdStream.next(this.resourceId);
    }
  }

  private _startLogs() {

    if (this.isPolling) {
      return;
    }

    this.commands[0].click = () => this._stopLogs();
    this.commands[0].iconUrl = 'image/pause.svg';
    this.commands[0].text = 'Pause';

    this.isPolling = true;

    // TODO: need to be polling on `${this.mainSiteUrl}/admin/host/status` to keep logging

    Observable.of(null)
      .delay(this._totalPollingDuration)
      .takeUntil(this._ngUnsubscribe)
      .takeUntil(this._stopPolling)
      .subscribe(_ => {
        this._stopLogs();
      });

    Observable.timer(0, this._pollingInterval)
      .takeUntil(this._ngUnsubscribe)
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

  private _stopLogs() {
    this.commands[0].click = () => this._startLogs();
    this.commands[0].iconUrl = 'image/start.svg';
    this.commands[0].text = 'Start';

    this.logContent += 'Logging paused';
    this._stopPolling.next();
    this.isPolling = false;
  }


}
