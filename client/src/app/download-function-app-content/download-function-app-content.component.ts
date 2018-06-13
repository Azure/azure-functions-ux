import { FunctionAppContext } from 'app/shared/function-app-context';
import { PortalResources } from './../shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from './../shared/models/select-option';
import { Subject } from 'rxjs/Subject';
import { Component, Input, Output } from '@angular/core';
import { KeyCodes } from 'app/shared/models/constants';
import { FunctionAppService } from '../shared/services/function-app.service';

type DownloadOption = 'siteContent' | 'vsProject';

@Component({
    selector: 'download-function-app-content',
    templateUrl: './download-function-app-content.component.html',
    styleUrls: ['./download-function-app-content.component.scss']
})
export class DownloadFunctionAppContentComponent {
    @Input() public context: FunctionAppContext;
    @Output() public close: Subject<boolean>;

    public downloadOptions: SelectOption<DownloadOption>[];
    public currentDownloadOption: DownloadOption;
    public includeAppSettings: boolean;

    constructor(private _translateService: TranslateService, private _functionAppService: FunctionAppService) {
        this.close = new Subject<boolean>();
        this.downloadOptions = [{
            displayLabel: this._translateService.instant(PortalResources.downloadFunctionAppContent_siteContent),
            value: 'siteContent'
        }, {
            displayLabel: this._translateService.instant(PortalResources.downloadFunctionAppContent_vsProject),
            value: 'vsProject'
        }];
        this.includeAppSettings = false;
        this.currentDownloadOption = 'siteContent';
    }

    downloadFunctionAppContent() {
        if (this.context) {
            const includeCsProj = this.currentDownloadOption === 'siteContent' ? false : true;

            this._functionAppService.getAppContentAsZip(this.context, includeCsProj, this.includeAppSettings)
                .subscribe(data => {
                    if (data.isSuccessful) {
                        window.open(window.URL.createObjectURL(data.result));
                    }
                });
        }
    }

    closeModal() {
        this.close.next();
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.escape) {
            this.closeModal();
        }
    }
}
