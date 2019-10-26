import { Component, Output } from '@angular/core';
import { CacheService } from './../../shared/services/cache.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { Subject } from 'rxjs/Subject';
import { ArmService } from '../../shared/services/arm.service';
import { FunctionAppContextComponent } from '../../shared/components/function-app-context-component';
import { FunctionAppService } from '../../shared/services/function-app.service';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { FunctionService } from 'app/shared/services/function.service';

@Component({
  selector: 'sql',
  templateUrl: './sql.component.html',
  styleUrls: ['./../picker.scss'],
})
export class SqlComponent extends FunctionAppContextComponent {
  public endpoint: string;
  public databaseName: string;
  public userName: string;
  public password: string;
  public selectInProcess = false;
  public canSelect = false;

  @Output()
  close = new Subject<void>();
  @Output()
  selectItem = new Subject<string>();

  constructor(
    private _cacheService: CacheService,
    private _armService: ArmService,
    private _globalStateService: GlobalStateService,
    functionAppService: FunctionAppService,
    broadcastService: BroadcastService,
    functionService: FunctionService
  ) {
    super('sql', functionAppService, broadcastService, functionService);
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
    this._cacheService
      .postArm(`${this.context.site.id}/config/appsettings/list`, true)
      .flatMap(r => {
        const appSettings: ArmObj<any> = r.json();
        appSettingName = this.databaseName + '.' + this.endpoint;
        appSettings.properties[appSettingName] = connectionStringFormat.format(
          this.endpoint,
          this.databaseName,
          this.userName,
          this.password
        );
        return this._cacheService.putArm(appSettings.id, this._armService.antaresApiVersion20181101, appSettings);
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
