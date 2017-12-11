import { Component, OnInit, Input, Output } from '@angular/core';
import { CacheService } from './../../shared/services/cache.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { FunctionApp } from '../../shared/function-app';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { Subject } from 'rxjs/Subject';
import { ArmService } from '../../shared/services/arm.service';

@Component({
    selector: 'sql',
    templateUrl: './sql.component.html',
    styleUrls: ['./../picker.scss']
})
export class SqlComponent implements OnInit {

    public endpoint: string;
    public databaseName: string;
    public userName: string;
    public password: string;
    public selectInProcess = false;
    public canSelect = false;

    @Output() close = new Subject<void>();
    @Output() selectItem = new Subject<string>();

    private _functionApp: FunctionApp;

    constructor(
        private _cacheService: CacheService,
        private _armService: ArmService,
        private _globalStateService: GlobalStateService) {

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
        const connectionStringFormat = 'Data Source=tcp:{0},1433;Initial Catalog={1};User Id={2};Password={3};';
        this.selectInProcess = true;
        let appSettingName: string;
        this._globalStateService.setBusyState();
        this._cacheService.postArm(`${this._functionApp.site.id}/config/appsettings/list`, true).flatMap(r => {
            const appSettings: ArmObj<any> = r.json();
            appSettingName =  this.databaseName + '.' + this.endpoint ;
            appSettings.properties[appSettingName] = connectionStringFormat.format(this.endpoint, this.databaseName, this.userName, this.password);
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

    valid(): boolean {
        return !!this.endpoint && !!this.databaseName && !!this.userName && !!this.password;
    }
}
