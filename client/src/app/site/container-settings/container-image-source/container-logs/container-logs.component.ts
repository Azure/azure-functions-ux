import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { Container, ContainerConfigureData } from '../../container-settings';
import { ContainerLogsService } from '../../services/container-logs.service';
import { FeatureComponent } from '../../../../shared/components/feature-component';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpResult } from '../../../../shared/models/http-result';

@Component({
    selector: 'container-logs',
    templateUrl: './container-logs.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './container-logs.component.scss',
    ],
})
export class ContainerLogsComponent extends FeatureComponent<ContainerConfigureData> implements OnDestroy {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.setInput(containerConfigureInfo);
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;
    public log: string;
    public loadingMessage: string;
    public logLink: SafeUrl;
    private _blobUrl: string;

    constructor(
        private _containerLogsService: ContainerLogsService,
        private _domSanitizer: DomSanitizer,
        private _ts: TranslateService,
        injector: Injector) {
        super('ContainerLogsComponent', injector, 'dashboard');
        this.featureName = 'ContainerSettings';
        this.loadingMessage = this._ts.instant(PortalResources.loading);
        this.log = this.loadingMessage;
    }

    protected setup(inputEvents: Observable<ContainerConfigureData>) {
        return inputEvents
            .distinctUntilChanged()
            .switchMap(containerConfigureInfo => {
                this.containerConfigureInfo = containerConfigureInfo;
                this.clearBusyEarly();

                return this._containerLogsService.getContainerLogs(containerConfigureInfo.resourceId);
            })
            .do(logResponse => {
                this._displayLog(logResponse);
            });
    }

    public clickDownload() {
        // http://stackoverflow.com/questions/24501358/how-to-set-a-header-for-a-http-get-request-and-trigger-file-download/24523253#24523253
        const windowUrl = window.URL || (<any>window).webkitURL;
        const blob = new Blob([this.log], { type: 'application/octet-stream' });
        this._cleanupBlob();

        if (window.navigator.msSaveOrOpenBlob) {
            // Currently, Edge doesn' respect the "download" attribute to name the file from blob
            // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/7260192/
            window.navigator.msSaveOrOpenBlob(blob, `container.log`);
        } else {
            // http://stackoverflow.com/questions/37432609/how-to-avoid-adding-prefix-unsafe-to-link-by-angular2
            this._blobUrl = windowUrl.createObjectURL(blob);
            this.logLink = this._domSanitizer.bypassSecurityTrustUrl(this._blobUrl);

            setTimeout(() => {

                const hiddenLink = document.getElementById('hidden-log-link');
                hiddenLink.click();
                this.logLink = null;
            });
        }
    }

    public clickRefresh() {
        this.log = this.loadingMessage;
        this._containerLogsService
            .getContainerLogs(this.containerConfigureInfo.resourceId, true)
            .subscribe(logResponse => {
                this._displayLog(logResponse);
            });
    }

    private _displayLog(logResponse: HttpResult<any>) {
        if (logResponse.isSuccessful) {
            if (logResponse.result && logResponse.result._body) {
                this.log = logResponse.result._body;
            } else {
                this.log = this._ts.instant(PortalResources.noLogsAvailable);
            }
        } else {
            this.log = this._ts.instant(PortalResources.errorRetrievingLogs);
        }
    }

    private _cleanupBlob() {
        const windowUrl = window.URL || (<any>window).webkitURL;
        if (this._blobUrl) {
            windowUrl.revokeObjectURL(this._blobUrl);
            this._blobUrl = null;
        }
    }
}
