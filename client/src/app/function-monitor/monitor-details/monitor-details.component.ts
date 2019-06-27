import { Component, Input, Injector, Output } from '@angular/core';
import { ComponentNames } from '../../shared/models/constants';
import { FeatureComponent } from '../../shared/components/feature-component';
import { MonitorDetailsInfo } from '../../shared/models/function-monitor';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationInsightsService } from '../../shared/services/application-insights.service';
import { Observable } from 'rxjs/Observable';
import { PortalResources } from '../../shared/models/portal-resources';
import { AIInvocationTraceHistory } from '../../shared/models/application-insights';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: ComponentNames.monitorDetails,
  templateUrl: './monitor-details.component.html',
  styleUrls: ['./../function-monitor.component.scss', './monitor-details.component.scss'],
})
export class MonitorDetailsComponent extends FeatureComponent<MonitorDetailsInfo> {
  @Input()
  set monitorDetailsInfoInput(monitorDetailsInfo: MonitorDetailsInfo) {
    this.functionName = this._translateService.instant(PortalResources.loading);
    this.isLoading = true;
    this.historyMessage = null;
    this.selectedRowId = null;
    this.setInput(monitorDetailsInfo);
  }

  @Output()
  closePanel = new Subject();

  private _monitorDetailsInfo: MonitorDetailsInfo;
  public functionName: string;
  public operationId: string;
  public traceHistory: AIInvocationTraceHistory[];
  public isLoading: boolean = true;
  public historyMessage: string = null;
  public selectedRowId: number;

  constructor(
    private _translateService: TranslateService,
    private _applicationInsightsService: ApplicationInsightsService,
    injector: Injector
  ) {
    super(ComponentNames.monitorDetails, injector, 'sidebar');
    this.featureName = ComponentNames.functionMonitor;
  }

  protected setup(monitorDetailsInfoInputEvent: Observable<MonitorDetailsInfo>) {
    return monitorDetailsInfoInputEvent
      .switchMap(monitorDetailsInfo =>
        Observable.zip(
          Observable.of(monitorDetailsInfo),
          this._applicationInsightsService.getInvocationTraceHistory(
            monitorDetailsInfo.functionMonitorInfo.appInsightsResourceDescriptor.getTrimmedResourceId(),
            monitorDetailsInfo.operationId
          )
        )
      )
      .do(tuple => {
        this.isLoading = false;
        this._monitorDetailsInfo = tuple[0];
        this.functionName = this._monitorDetailsInfo.functionMonitorInfo.functionName;
        this.operationId = this._monitorDetailsInfo.operationId;
        this.traceHistory = tuple[1];
      });
  }

  public openAppInsightsQueryEditor() {
    const url = this._applicationInsightsService.getInvocationTraceHistoryDirectUrl(
      this._monitorDetailsInfo.functionMonitorInfo.appInsightsResourceDescriptor.getResourceIdForDirectUrl(),
      this._monitorDetailsInfo.operationId
    );

    window.open(url, '_blank');
  }

  close() {
    this.closePanel.next();
  }

  public showHistoryMessage(traceHistory: AIInvocationTraceHistory) {
    this.selectedRowId = traceHistory.rowId;
    this.historyMessage = traceHistory.message;
  }
}
