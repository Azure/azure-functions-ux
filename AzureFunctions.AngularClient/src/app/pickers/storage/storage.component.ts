import { Component, OnInit, Input, Output } from '@angular/core';
import { CacheService } from './../../shared/services/cache.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { FunctionApp } from '../../shared/function-app';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { Subject } from 'rxjs/Subject';
import { ArmService } from '../../shared/services/arm.service';
import { SelectOption } from '../../shared/models/select-option';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';

class OptionTypes {
    azure = 'Azure';
    other = 'Other';
}

@Component({
    selector: 'storage',
    templateUrl: './storage.component.html',
    styleUrls: ['./../picker.scss']
})
export class StorageComponent implements OnInit {

    public accountName: string;
    public accountKey: string;
    public endpoint: string;
    public selectInProcess = false;
    public canSelect = false;
    public optionsChange: Subject<string>;
    public optionTypes: OptionTypes = new OptionTypes();
    public options: SelectOption<string>[];
    public option: string;

    @Output() close = new Subject<void>();
    @Output() selectItem = new Subject<string>();

    private _functionApp: FunctionApp;

    constructor(
        private _cacheService: CacheService,
        private _armService: ArmService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) {
            this.options = [
                {
                    displayLabel: this._translateService.instant(PortalResources.storage_endpoint_azure),
                    value: this.optionTypes.azure,
                },
                {
                    displayLabel: this._translateService.instant(PortalResources.storage_endpoint_other),
                    value: this.optionTypes.other
                }
            ];

            const azureStorageEndpoint = 'core.windows.net';
            this.option = this.optionTypes.azure;
            this.endpoint = azureStorageEndpoint;

            this.optionsChange = new Subject<string>();
            this.optionsChange.subscribe((option) => {
                if (option === this.optionTypes.azure) {
                    this.endpoint = azureStorageEndpoint;
                } else {
                    this.endpoint = '';
                }
                this.option = option;
            });
        }

    ngOnInit() {
    }


    @Input() set functionApp(functionApp: FunctionApp) {
        this._functionApp = functionApp;
    }

    onClose() {
        if (!this.selectInProcess) {
            this.close.next(null);
        }
    }

    onSelect() {
        const storageConnectionStringFormat = 'DefaultEndpointsProtocol=https;AccountName={0};AccountKey={1}';
        const explicitStorageConnectionStringFormat = 'DefaultEndpointsProtocol=https;BlobEndpoint={0};AccountName={1};AccountKey={2}';
        this.selectInProcess = true;
        let appSettingName: string;
        this._globalStateService.setBusyState();
        this._cacheService.postArm(`${this._functionApp.site.id}/config/appsettings/list`, true).flatMap(r => {
            const appSettings: ArmObj<any> = r.json();
            appSettingName = appSettings.properties['AzureWebJobsStorage'] ? this.accountName + '.' + this.endpoint : 'AzureWebJobsStorage';
            appSettings.properties[appSettingName] = this.option === this.optionTypes.azure ?
                storageConnectionStringFormat.format(this.accountName, this.accountKey)
                : explicitStorageConnectionStringFormat.format(this.endpoint, this.accountName, this.accountKey);
            return this._cacheService.putArm(appSettings.id, this._armService.websiteApiVersion, appSettings);
        })
            .do(null, e => {
                this._globalStateService.clearBusyState();
                this.selectInProcess = false;
                console.log(e);
            })
            .subscribe(() => {
                this._globalStateService.clearBusyState();
                this.selectItem.next(appSettingName);
            });
    }
}
