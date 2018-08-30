import { Component, Input, Injector, OnDestroy, ComponentFactory, ComponentRef, ViewContainerRef, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo, SiteData } from '../../tree-view/models/tree-view-info';
import { Subject } from 'rxjs/Subject';
import { SelectOption } from '../../shared/models/select-option';
import { SiteService } from '../../shared/services/site.service';
import { LogService } from '../../shared/services/log.service';
import { CacheService } from '../../shared/services/cache.service';
import { SiteTabIds, LogCategories, LogConsoleTypes, Regex, ConsoleConstants, HostTypes } from '../../shared/models/constants';
import { Observable } from 'rxjs/Observable';
import { PublishingCredentials } from '../../shared/models/publishing-credentials';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Site } from '../../shared/models/arm/site';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { LogContentComponent } from './log-content.component';
import { FunctionAppService } from '../../shared/services/function-app.service';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../shared/services/user.service';
import { UtilitiesService } from '../../shared/services/utilities.service';

enum LogTypes {
    Application = 1,
    WebServer = 2,
};

@Component({
    selector: 'app-log-stream',
    templateUrl: './log-stream.component.html',
    styleUrls: ['./log-stream.component.scss'],
})
export class LogStreamComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnDestroy {

    public toggleLog = true;
    public resourceId: string;
    public timerInterval = 1000;
    public initialized = false;
    public clearLogs = false;
    public logsText = '';
    public viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
    public currentOption: number;
    public options: SelectOption<number>[];
    public optionsChange: Subject<number>;
    public stopped = false;
    public popOverTimeout = 500;
    private _isConnectionSuccessful = true;
    private _tokenSubscription: Subscription;
    private _token: string;
    private _logStreamIndex = 0;
    private _xhReq: XMLHttpRequest;
    private _timeouts: number[] = [];
    private _logStreamType: 'application' | 'http';
    private _publishingCredentials: ArmObj<PublishingCredentials>;
    private _site: ArmObj<Site>;
    private _logContentComponent: ComponentFactory<any>;
    private _logComponents: ComponentRef<any>[] = [];
    @ViewChild('logs', {read: ViewContainerRef})
    private _logElement: ViewContainerRef;
    @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        this.setInput(viewInfo);
    }

    constructor(
        private _translateService: TranslateService,
        private _siteService: SiteService,
        private _logService: LogService,
        private _cacheService: CacheService,
        private _utilities: UtilitiesService,
        private _userService: UserService,
        private _functionAppService: FunctionAppService,
        private _componentFactoryResolver: ComponentFactoryResolver,
        injector: Injector,
    ) {
        super('site-log-stream', injector, SiteTabIds.logStream);
        this.featureName = 'log-stream';
        this._logStreamType = 'application';
        this.isParentComponent = true;
        this.initialized = true;
        this.optionsChange = new Subject<number>();
        this.optionsChange
        .takeUntil(this.ngUnsubscribe)
        .subscribe((option) => {
            this.currentOption = option;
            this._onOptionChange();
        });
        this._setDefaultRadioOptions();
        this.currentOption = LogTypes.Application;
        this._logContentComponent = this._componentFactoryResolver.resolveComponentFactory(LogContentComponent);
        this._tokenSubscription = this._userService.getStartupInfo().subscribe(s => this._token = s.token);
    }

    ngOnDestroy() {
        if (this._xhReq) {
            this._resetXMLHttpRequest();
        }
        if (this._tokenSubscription) {
            this._tokenSubscription.unsubscribe();
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
        for (let i = this._logComponents.length; i > 0; --i) {
            this._logComponents.pop().destroy();
        }
    }

    /**
     *
     * @param inputEvents Observable<TreeViewInfo<SiteData>>
     */
    protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
        // ARM API request to get the site details and the publishing credentials
        return inputEvents
        .distinctUntilChanged()
        .switchMap(view => {
            this.setBusy();
            this.logsText = '';
            this.resourceId = view.resourceId;
            return Observable.zip(
                this._siteService.getSite(this.resourceId),
                this._cacheService.postArm(`${this.resourceId}/config/publishingcredentials/list`),
                (site, publishingCredentials) => ({
                    site: site.result,
                    publishingCredentials: publishingCredentials.json(),
                }),
            );
        })
        .do(
            r => {
                this._site = r.site;
                this._publishingCredentials = r.publishingCredentials;
                this._startStreamingRequest();
                this.clearBusyEarly();
            },
            err => {
                this._logService.error(LogCategories.cicd, '/load-log-stream', err);
                this.clearBusyEarly();
            },
        );
    }

    /**
     * Get api url for the current type of logs.
     */
    private _getLogUrl(): string {
        const scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === HostTypes.scm).name;
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
            if (this._functionAppService._tryFunctionsBasicAuthToken) {
                this._xhReq.setRequestHeader('Authorization', `Basic ` + btoa(`${this._publishingCredentials.properties.publishingUserName}:${this._publishingCredentials.properties.publishingPassword}`));
            } else {
                this._xhReq.setRequestHeader('Authorization', `Bearer ${this._token}`);
            }
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
        const logArray = logStream.split(ConsoleConstants.newLine);
        let logs = logArray[0];
        let type = this._getLogType(logs);
        for (let i = 1; i < logArray.length; ++i) {
            const currentLogType = this._getLogType(logArray[i]);
            if (currentLogType === -1) {
                logs += ConsoleConstants.newLine + logArray[i];
            } else {
                this._addLogContent(logs, type);
                logs = logArray[i];
                type = currentLogType;
            }
        }
        this._addLogContent(logs, type);
    }

    /**
     * Get the log type based on the given string
     * @param log string which contains a single log
     */
    private _getLogType(log: string) {
        if (log.match(Regex.errorLog)) {
            return LogConsoleTypes.Error;
        }
        if (log.match(Regex.infoLog)) {
            return LogConsoleTypes.Info;
        }
        if (log.match(Regex.warningLog)) {
            return LogConsoleTypes.Warning;
        }
        if (log.match(Regex.log)) {
            return LogConsoleTypes.Normal;
        }
        return -1;
    }

    /**
     * This function adds the log content to the console giving it a color
     * according to the type specified
     * @param logs string which containts the log
     * @param type represents the particular type of the log
     */
    private _addLogContent(logs: string, type: number) {
        if (logs.trim() === '' || (type === -1 && this._logComponents.length === 0)) {
            return;
        }
        if (type === -1) {
            this._logComponents[this._logComponents.length - 1].instance.logs += logs;
            return;
        }
        const component = this._logElement.createComponent(this._logContentComponent);
        component.instance.logs = logs.trim();
        component.instance.type = type;
        this._logComponents.push(component);
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
