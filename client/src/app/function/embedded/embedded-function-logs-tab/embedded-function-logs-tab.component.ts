import { PortalResources } from 'app/shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { LogService } from 'app/shared/services/log.service';
import { BroadcastEvent } from './../../../shared/models/broadcast-event';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BottomTabComponent } from './../../../controls/bottom-tabs/bottom-tab.component';
import { ArmService } from './../../../shared/services/arm.service';
import { Observable } from 'rxjs/Observable';
import { CacheService } from './../../../shared/services/cache.service';
import { Subject } from 'rxjs/Subject';
import { Component, Input, OnChanges, SimpleChange, OnDestroy } from '@angular/core';
import { FunctionEditorEvent } from 'app/function/embedded/function-editor-event';
import { Subscription } from 'rxjs/Subscription';
import { LogCategories } from 'app/shared/models/constants';
import { VfsObject } from 'app/shared/models/vfs-object';
import { UtilitiesService } from '../../../shared/services/utilities.service';

@Component({
  selector: 'embedded-function-logs-tab',
  templateUrl: './embedded-function-logs-tab.component.html',
  styleUrls: ['./embedded-function-logs-tab.component.scss']
})
export class EmbeddedFunctionLogsTabComponent extends BottomTabComponent implements OnChanges, OnDestroy {
  @Input() resourceId: string;

  public logContent = '';
  public isPolling = false;

  private _stopPolling = new Subject();
  private _ngUnsubscribe = new Subject();
  private _totalPollingDuration = 300000;
  private _pollingInterval = 5000;
  private _timerSub: Subscription;

  private _resourceIdStream = new Subject<string>();

  constructor(
    private _cacheService: CacheService,
    private _armService: ArmService,
    private _broadcastService: BroadcastService,
    private _logService: LogService,
    private _translateService: TranslateService,
    private _utilities: UtilitiesService) {
    super();

    this._resourceIdStream
      .takeUntil(this._ngUnsubscribe)
      .distinctUntilChanged()
      .subscribe(resourceId => {
        this._startLogs();

        this._setupPingsToStatus(resourceId);
      });

    this._broadcastService.getEvents<FunctionEditorEvent<void>>(BroadcastEvent.FunctionEditorEvent)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(r => {
        switch (r.type) {
          case 'copyLogs':
            this._copyLogs();
            break;
          case 'pauseLogs':
            this._stopLogs();
            break;
          case 'startLogs':
            this._startLogs();
            break;
          case 'clearLogs':
            this._clearLogs();
            break;
          default:
            break;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (changes['resourceId']) {
      this._resourceIdStream.next(this.resourceId);
    }
  }

  // The purpose of this is two-fold:
  // 1. This will get runtime status at the app-level
  // 2. This will also keep the logs API alive so that we can view logs
  private _setupPingsToStatus(resourceId: string) {
    if (this._timerSub) {
      this._timerSub.unsubscribe();
    }

    this._timerSub = Observable.timer(0, 45000)
      .takeUntil(this._ngUnsubscribe)
      .switchMap(_ => {
        const statusId = resourceId.split('/').splice(0, 9).join('/') + '/status';
        return this._cacheService.getArm(statusId, true);
      })
      .subscribe(r => {
      }, err => {
        this._logService.error(LogCategories.FunctionEdit, '/embedded/editor-status', 'Ping to function status failed');
      });
  }

  private _startLogs() {

    if (this.isPolling) {
      return;
    }

    this.isPolling = true;

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
        return this._cacheService.getArm(`${this.resourceId}/logs`, true)
          .catch((err) => {
            return Observable.zip(
              Observable.of(null),
              Observable.of(err.text())
          );
        });
      })
      .switchMap(tuple => {
        if (tuple[0]) {
          const files: VfsObject[] = tuple[0].json();
          if (files.length > 0) {

            files
              .map(e => { e.parsedTime = new Date(e.mtime); return e; })
              .sort((a, b) => a.parsedTime.getTime() - b.parsedTime.getTime());

            const headers = this._armService.getHeaders();
            headers.append('Range', `bytes=-${10000}`);
            const url = this._armService.getArmUrl(this.resourceId);
            return this._cacheService.get(`${url}/logs/${files.pop().name}`, true, headers)
                .catch((err) => {
                  return Observable.zip(
                          Observable.of(null),
                          Observable.of(err.text())
                  );
                });
          }
        }
        return Observable.zip(
            Observable.of(null),
            Observable.of(tuple[1])
        );
      })
      .subscribe(tuple => {
        if (tuple[0]) {
          this.logContent = tuple[0].text();
        } else if (tuple[1]) {
          this.logContent = this._translateService.instant(PortalResources.logStreaming_failedToDownload).format(tuple[1]);
        } else {
          this.logContent = this._translateService.instant(PortalResources.logStreaming_noLogs);
        }
      });
  }

  private _stopLogs() {
    this.logContent += '\n' + this._translateService.instant(PortalResources.logStreaming_paused);
    this._stopPolling.next();
    this.isPolling = false;
  }

  private _copyLogs() {
    this._utilities.copyContentToClipboard(this.logContent);
  }

  private _clearLogs() {
    this._stopLogs();
    this.logContent = '';
  }

}
