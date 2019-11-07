import { Component, Input, Injector, ViewChild } from '@angular/core';
import { ComponentNames, LogCategories } from '../../shared/models/constants';
import { FeatureComponent } from '../../shared/components/feature-component';
import { FunctionMonitorInfo, MonitorConfigureInfo } from '../../shared/models/function-monitor';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { FunctionAppService } from '../../shared/services/function-app.service';
import { FunctionMonitorService } from '../../shared/services/function-monitor.service';
import { TableFunctionMonitorComponent } from '../../table-function-monitor/table-function-monitor.component';
import * as moment from 'moment-mini-ts';
import { PortalService } from '../../shared/services/portal.service';
import { LogService } from '../../shared/services/log.service';
import { BroadcastEvent } from '../../shared/models/broadcast-event';
import { errorIds } from '../../shared/models/error-ids';

@Component({
  selector: ComponentNames.monitorClassic,
  templateUrl: './monitor-classic.component.html',
  styleUrls: ['./../function-monitor.component.scss', './monitor-classic.component.scss'],
})
export class MonitorClassicComponent extends FeatureComponent<FunctionMonitorInfo> {
  @ViewChild(TableFunctionMonitorComponent)
  tableFunctionMonitorComponent: TableFunctionMonitorComponent;

  @Input()
  set functionMonitorInfoInput(functionMonitorInfo: FunctionMonitorInfo) {
    this.successAggregate = this.errorsAggregate = this._translateService.instant(PortalResources.functionMonitor_loading);
    this.monitorConfigureInfo = null;
    this.setInput(functionMonitorInfo);
  }

  public successAggregateHeading: string;
  public errorsAggregateHeading: string;
  public successAggregate: string;
  public errorsAggregate: string;
  public functionId: string;
  public functionMonitorInfo: FunctionMonitorInfo;
  public monitorConfigureInfo: MonitorConfigureInfo;

  constructor(
    private _translateService: TranslateService,
    private _functionAppService: FunctionAppService,
    private _functionMonitorService: FunctionMonitorService,
    private _portalService: PortalService,
    private _logService: LogService,
    injector: Injector
  ) {
    super(ComponentNames.monitorApplicationInsights, injector, 'dashboard');
    this.featureName = ComponentNames.functionMonitor;
    this._setHeaders();
  }

  protected setup(functionMonitorInfoInputEvent: Observable<FunctionMonitorInfo>) {
    return functionMonitorInfoInputEvent
      .switchMap(functionMonitorInfo => {
        this.functionMonitorInfo = functionMonitorInfo;

        return this._functionAppService.getFunctionHostStatus(functionMonitorInfo.functionAppContext).flatMap(functionHost => {
          if (functionHost.isSuccessful) {
            return this._functionMonitorService.getDataForSelectedFunction(
              functionMonitorInfo.functionAppContext,
              functionMonitorInfo.functionName,
              functionHost.result.id
            );
          } else {
            this.monitorConfigureInfo = {
              functionMonitorInfo: this.functionMonitorInfo,
              errorEvent: {
                errorId: functionHost.error.errorId,
                message: this._translateService.instant(PortalResources.monitorHostFetchFailed),
                resourceId: functionMonitorInfo.functionAppContext.site.id,
              },
            };

            return Observable.of(null);
          }
        });
      })
      .do(data => {
        this.functionId = !!data ? data.functionId : '';
        this.successAggregate = !!data
          ? data.successCount.toString()
          : this._translateService.instant(PortalResources.appMonitoring_noData);
        this.errorsAggregate = !!data ? data.failedCount.toString() : this._translateService.instant(PortalResources.appMonitoring_noData);
      });
  }

  get shouldRenderMonitorConfigure() {
    return this.monitorConfigureInfo !== null && this.monitorConfigureInfo.errorEvent !== null;
  }

  get shouldRenderAppInsightsUpsell() {
    return this.functionMonitorInfo !== null && this.functionMonitorInfo !== null && this.functionMonitorInfo.appInsightResourceEnabled;
  }

  public refreshMonitorClassicData() {
    this.setInput(this.functionMonitorInfo);
    this.tableFunctionMonitorComponent.refresh();
  }

  public configure() {
    const appInsightBladeInput = {
      detailBlade: 'AppServicesEnablementBlade',
      detailBladeInputs: {
        resourceUri: this.functionMonitorInfo.functionAppContext.site.id,
        linkedComponent: null,
      },
      extension: 'AppInsightsExtension',
    };

    this._portalService.openBlade(appInsightBladeInput, ComponentNames.functionMonitor).subscribe(
      result => {
        this._broadcastService.broadcastEvent<FunctionMonitorInfo>(BroadcastEvent.RefreshMonitoringView, this.functionMonitorInfo);
      },
      err => {
        this._logService.error(LogCategories.applicationInsightsConfigure, errorIds.applicationInsightsConfigure, err);
      }
    );
  }

  private _setHeaders(): void {
    const firstOfMonth = moment().startOf('month');
    this.successAggregateHeading = `${this._translateService.instant(
      PortalResources.functionMonitor_successAggregate
    )} ${firstOfMonth.format('MMM Do')}`;
    this.errorsAggregateHeading = `${this._translateService.instant(PortalResources.functionMonitor_errorsAggregate)} ${firstOfMonth.format(
      'MMM Do'
    )}`;
  }
}
