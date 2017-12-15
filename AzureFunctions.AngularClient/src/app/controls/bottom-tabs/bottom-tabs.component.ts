import { Observable } from 'rxjs/Observable';
import { CacheService } from './../../shared/services/cache.service';
import { Subject } from 'rxjs/Subject';
import { FunctionApp } from 'app/shared/function-app';
import { Component, Output, OnInit, Input } from '@angular/core';
import { ArmService } from 'app/shared/services/arm.service';

@Component({
  selector: 'bottom-tabs',
  templateUrl: './bottom-tabs.component.html',
  styleUrls: ['./bottom-tabs.component.scss']
})
export class BottomTabsComponent implements OnInit {
  @Input() resourceId: string;
  @Output() onExpanded = new Subject<boolean>();

  public functionApp: FunctionApp = null;
  public expanded = false;
  public logContent = '';
  public isPolling = false;

  private _stopPolling = new Subject();

  constructor(
    private _cacheService: CacheService,
    private _armService: ArmService
  ) {

  }

  ngOnInit() {
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

    this.isPolling = true;

    Observable.of(null)
      .delay(30000)
      .takeUntil(this._stopPolling)
      .subscribe(_ => {
        this.stopLogs();
      });

    Observable.timer(0, 5000)
      .takeUntil(this._stopPolling)
      .switchMap(t => {
        return this._cacheService.getArm(`${this.resourceId}/logs`, true)
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
    this._stopPolling.next();
    this.isPolling = false;
  }

  clearLogs() {
    this.logContent = '';
  }
}
