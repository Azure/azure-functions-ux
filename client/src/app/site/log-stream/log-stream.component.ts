import { Component, Input, Injector, OnDestroy } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo, SiteData } from '../../tree-view/models/tree-view-info';
import { Subject } from 'rxjs/Subject';
import { SelectOption } from '../../shared/models/select-option';
import { SiteService } from '../../shared/services/site.service';
import { LogService } from '../../shared/services/log.service';
import { CacheService } from '../../shared/services/cache.service';
import { SiteTabIds, LogCategories, HttpMethods } from '../../shared/models/constants';
import { Observable } from 'rxjs/Observable';
import { PublishingCredentials } from '../../shared/models/publishing-credentials';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Site } from '../../shared/models/arm/site';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';

enum LogTypes {
    Application = 1,
    WebServer = 2
};

@Component({
    selector: 'app-log-stream',
    templateUrl: './log-stream.component.html',
    styleUrls: ['./log-stream.component.scss'],
})
export class LogStreamComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnDestroy {

    public toggleLog = true;
    public logIcon = 'image/log-stream.svg';
    public resourceId: string;
    public initialized = false;
    public clearLogs = false;
    public logsText = '';
    public appName: string;
    public viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
    public currentOption: number;
    public options: SelectOption<number>[];
    public optionsChange: Subject<number>;
    private _logStreamType: 'application' | 'http';
    private _publishingCredentials: ArmObj<PublishingCredentials>;
    private _site: ArmObj<Site>;
    private _xhr: XMLHttpRequest;
    private _responseTextNumber = 0;
    @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        this.setInput(viewInfo);
    }

    constructor(
        private _translateService: TranslateService,
        private _siteService: SiteService,
        private _logService: LogService,
        private _cacheService: CacheService,
        injector: Injector
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
        this._initXMLRequest();
    }

    ngOnDestroy() {
        if (this._xhr) {
            this._xhr.abort();
        }
    }

    /**
     * Clear Logs
     */
    public clearLogText() {
        this.clearLogs = true;
        this.logsText = '';
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
            this.resourceId = view.resourceId;
            return Observable.zip(
                this._siteService.getSite(this.resourceId),
                this._cacheService.postArm(`${this.resourceId}/config/publishingcredentials/list`),
                this._cacheService.getArm(`${this.resourceId}/config/logs`),
                (site, publishingCredentials, logs) => ({
                    site: site.result,
                    publishingCredentials: publishingCredentials.json(),
                    logs: logs.json()
                })
            );
        })
        .do(
            r => {
                this._site = r.site;
                this._publishingCredentials = r.publishingCredentials;
                this.appName = r.publishingCredentials.name;
                this._loadLogs();
                this.clearBusyEarly();
            },
            err => {
                this._logService.error(LogCategories.cicd, '/load-log-stream', err);
                this.clearBusyEarly();
            }
        );
    }

    /**
     * Get api url for the current type of logs.
     */
    private _getLogUrl(): string {
        const scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === 1).name;
        return `https://${scmHostName}/api/logstream/` + (this.toggleLog ? '' : this._logStreamType);
    }

    /**
     * Initialize XMLHttpRequest, set onprogress function on the request
     */
    private _initXMLRequest() {
        this._xhr = new XMLHttpRequest();
        this._xhr.onprogress = () => {
            const responseText = this._xhr.responseText;
            this.logsText += responseText.substring(this._responseTextNumber);
            this._responseTextNumber = responseText.length;
        };
    }

    /**
     * Load specific log, i.e. either Application or Web-Server
     */
    private _loadLogs() {
        const url = this._getLogUrl();
        this._xhr.open(HttpMethods.GET, url);
        this._xhr.setRequestHeader('Authorization', `Basic ` + btoa(`${this._publishingCredentials.properties.publishingUserName}:${this._publishingCredentials.properties.publishingPassword}`));
        this._xhr.send();
    }

    /**
     * Set Default Radio Options
     */
    private _setDefaultRadioOptions() {
        this.options = [
            {
                displayLabel: this._translateService.instant(PortalResources.feature_applicationLogsName),
                value: LogTypes.Application
            },
            {
                displayLabel: this._translateService.instant(PortalResources.feature_webServerLogsName),
                value: LogTypes.WebServer
            }
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
            this._responseTextNumber = 0;
            if (this._xhr && this._xhr.status !== XMLHttpRequest.DONE) {
                this._xhr.abort();
            }
            this._loadLogs();
            return;
        }
        if (this.currentOption === LogTypes.WebServer && this.toggleLog) {
            this._logStreamType = 'http';
            this.toggleLog = false;
            this.clearLogText();
            this.clearLogs = false;
            this._responseTextNumber = 0;
            if (this._xhr && this._xhr.status !== XMLHttpRequest.DONE) {
                this._xhr.abort();
            }
            this._loadLogs();
            return;
        }
    }
}
