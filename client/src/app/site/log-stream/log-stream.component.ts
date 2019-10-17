import { LogService } from './../../shared/services/log.service';
import { ScenarioService } from './../../shared/services/scenario/scenario.service';
import { Component, Input, Injector, OnDestroy } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo, SiteData } from '../../tree-view/models/tree-view-info';
import { Subject } from 'rxjs/Subject';
import { SelectOption } from '../../shared/models/select-option';
import { SiteService } from '../../shared/services/site.service';
import { SiteTabIds, LogLevel, Regex, ConsoleConstants, ScenarioIds, LogCategories } from '../../shared/models/constants';
import { Observable } from 'rxjs/Observable';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Site, HostType } from '../../shared/models/arm/site';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { UserService } from '../../shared/services/user.service';
import { UtilitiesService } from '../../shared/services/utilities.service';

export enum LogTypes {
  Application = 1,
  WebServer = 2,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
}

@Component({
  selector: 'app-log-stream',
  templateUrl: './log-stream.component.html',
  styleUrls: ['./log-stream.component.scss'],
})
export class AppLogStreamComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnDestroy {
  @Input()
  set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this.setInput(viewInfo);
  }

  public toggleLog = true;
  public resourceId: string;
  public timerInterval = 1000;
  public initialized = false;
  public clearLogs = false;
  public logsText = '';
  public currentOption: number;
  public options: SelectOption<number>[];
  public optionsChange: Subject<number>;
  public stopped = false;
  public popOverTimeout = 500;
  public logEntries: LogEntry[] = [];
  public showOptions: boolean;

  private _isConnectionSuccessful = true;
  private _token: string;
  private _logStreamIndex = 0;
  private _xhReq: XMLHttpRequest;
  private _timeouts: number[] = [];
  private _logStreamType: 'application' | 'http';
  private _site: ArmObj<Site>;
  private readonly _maxLogEntries = 1000;

  constructor(
    private _translateService: TranslateService,
    private _siteService: SiteService,
    private _utilities: UtilitiesService,
    private _userService: UserService,
    private _scenarioService: ScenarioService,
    private _logService: LogService,
    injector: Injector
  ) {
    super('site-log-stream', injector, SiteTabIds.logStream);
    this.featureName = 'log-stream';
    this._logStreamType = 'application';
    this.isParentComponent = true;
    this.initialized = true;
    this.optionsChange = new Subject<number>();
    this.optionsChange.takeUntil(this.ngUnsubscribe).subscribe(option => {
      this.currentOption = option;
      this._onOptionChange();
    });
    this._setDefaultRadioOptions();
    this.currentOption = LogTypes.Application;

    this._userService
      .getStartupInfo()
      .takeUntil(this.ngUnsubscribe)
      .subscribe(s => (this._token = s.token));
  }

  /**
   *
   * @param inputEvents Observable<TreeViewInfo<SiteData>>
   */
  protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(view => {
        this.showOptions = true;
        this.logsText = '';
        this.resourceId = view.resourceId;

        return this._siteService.getSite(this.resourceId);
      })
      .do(r => {
        if (r.isSuccessful) {
          this._site = r.result;

          if (this._scenarioService.checkScenario(ScenarioIds.addWebServerLogging, { site: this._site }).status === 'disabled') {
            this.showOptions = false;
          }

          this._startStreamingRequest();
        } else {
          this._logService.error(LogCategories.logStreamLoad, '/get-site', r.error);
        }
      });
  }

  ngOnDestroy() {
    if (this._xhReq) {
      this._resetXMLHttpRequest();
    }
  }

  reconnect() {
    this._isConnectionSuccessful = false;
    if (this.canReconnect()) {
      this._startStreamingRequest();
      this._isConnectionSuccessful = true;
    }
  }

  canReconnect(): boolean {
    if (this._xhReq) {
      return this._xhReq.readyState === XMLHttpRequest.DONE;
    }
    return true;
  }

  getPopoverText(): string {
    if (this._isConnectionSuccessful) {
      return PortalResources.logStreaming_reconnectSuccess;
    }
    return PortalResources.logStreaming_connectionExists;
  }

  /**
   * Copy current logs on the screen
   */
  public copyLogs() {
    this._utilities.copyContentToClipboard(this.logsText);
  }

  /**
   * Stop current logs
   */
  public stopLogs() {
    this.stopped = true;
  }

  /**
   * Start the logs again
   */
  public startLogs() {
    this.stopped = false;
  }

  /**
   * Clear Logs
   */
  public clearLogText() {
    this.clearLogs = true;
    this.logsText = '';
    this.logEntries = [];
  }

  public trackByFn(index: number, logEntry: LogEntry) {
    return index;
  }

  /**
   * Get api url for the current type of logs.
   */
  private _getLogUrl(): string {
    const scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === HostType.Repository).name;
    return `https://${scmHostName}/api/logstream/` + (this.toggleLog ? '' : this._logStreamType);
  }

  /**
   * Reset the previous request to get the stream of logs
   */
  private _resetXMLHttpRequest() {
    this._timeouts.forEach(window.clearTimeout);
    this._timeouts = [];
    this.logsText = '';
    this._xhReq.abort();
  }

  /**
   * Start log-streaming
   */
  private _startStreamingRequest() {
    const promise = new Promise<string>(resolve => {
      if (this._xhReq) {
        this._resetXMLHttpRequest();
      }
      this._xhReq = new XMLHttpRequest();
      this._xhReq.open('GET', this._getLogUrl(), true);
      this._xhReq.setRequestHeader('Authorization', `Bearer ${this._token}`);
      this._xhReq.setRequestHeader('FunctionsPortal', '1');
      this._xhReq.send(null);
      const callBack = () => {
        if (!this.stopped && this._logStreamIndex !== this._xhReq.responseText.length) {
          resolve(null);
          const newLogs = this._xhReq.responseText.substring(this._logStreamIndex);
          this.logsText += newLogs;
          if (newLogs !== '') {
            this._processLogs(newLogs);
          }
          this._logStreamIndex = this._xhReq.responseText.length;
          window.setTimeout(() => {
            const el = document.getElementById('log-body');
            if (el) {
              el.scrollTop = el.scrollHeight;
            }
          });
        }
        if (this._xhReq.readyState !== XMLHttpRequest.DONE) {
          this._timeouts.push(window.setTimeout(callBack, this.timerInterval));
        }
      };
      callBack();
    });
    return promise;
  }

  /**
   * This checks if we are over the limit of displayed characters {maxCharactersInLog} and then adds the logs to the console.
   * Logs can get really large and it can impact the browser perf if this variable {this.log}
   * grows un-checked.
   * @param logStream string which contains the logs to be displayed
   */
  private _processLogs(logStream: string) {
    const logMessages = logStream.split(ConsoleConstants.newLine);
    for (let i = 0; i < logMessages.length; ++i) {
      const logLevel = this._getLogLevel(logMessages[i]);
      this._addLogEntry(logMessages[i], logLevel);
    }
  }

  /**
   * Get the log type based on the given string
   * @param message string which contains a single log
   */
  private _getLogLevel(message: string) {
    if (message.match(Regex.errorLog)) {
      return LogLevel.Error;
    }
    if (message.match(Regex.infoLog)) {
      return LogLevel.Info;
    }
    if (message.match(Regex.warningLog)) {
      return LogLevel.Warning;
    }
    if (message.match(Regex.log)) {
      return LogLevel.Normal;
    }

    return LogLevel.Unknown;
  }

  /**
   * This function adds the log content to the console giving it a color
   * according to the type specified
   * @param message string which containts the log
   * @param logLevel represents the particular type of the log
   */
  private _addLogEntry(message: string, logLevel: LogLevel) {
    message = message ? message.trim() : message;

    if (!message) {
      return;
    }

    if (logLevel === LogLevel.Unknown) {
      if (this.logEntries.length === 0) {
        this.logEntries.push({
          level: LogLevel.Normal,
          message: message,
        });
      } else {
        // If a message is unknown, then we assume it's just a continuation of a previous line and just prepend it to
        // the previous line.  This allows us to write out single line entries for logs that are not formatted correctly.
        // Like for example, Functions logs formatted JSON objects to the console which looks ok, but breaks each log line
        // and formatting of each line.  Making this assumption of simply appending unknown strings to the previous line
        // may not be correct, but so far it seems to check out okay with our standard web apps logging format.
        this.logEntries[this.logEntries.length - 1].message += message;
      }

      return;
    }

    this.logEntries.push({
      level: logLevel,
      message: message,
    });

    if (this.logEntries.length > this._maxLogEntries) {
      this.logEntries.splice(0, 1);
    }
  }

  /**
   * Set Default Radio Options
   */
  private _setDefaultRadioOptions() {
    this.options = [
      {
        displayLabel: this._translateService.instant(PortalResources.feature_applicationLogsName),
        value: LogTypes.Application,
      },
      {
        displayLabel: this._translateService.instant(PortalResources.feature_webServerLogsName),
        value: LogTypes.WebServer,
      },
    ];
  }

  /**
   * Make the necessary changes when log-type is switched
   */
  private _onOptionChange() {
    if (this.currentOption === LogTypes.Application && !this.toggleLog) {
      this._logStreamType = 'application';
      this.toggleLog = true;
      this.clearLogText();
      this.clearLogs = false;

      if (this._xhReq) {
        this._resetXMLHttpRequest();
      }
      this._startStreamingRequest();
      return;
    }
    if (this.currentOption === LogTypes.WebServer && this.toggleLog) {
      this._logStreamType = 'http';
      this.toggleLog = false;
      this.clearLogText();
      this.clearLogs = false;
      if (this._xhReq) {
        this._resetXMLHttpRequest();
      }
      this._startStreamingRequest();

      return;
    }
  }
}
