import { Component, Input, Injector } from '@angular/core';
import { ComponentNames } from '../../shared/models/constants';
import { FeatureComponent } from '../../shared/components/feature-component';
import { MonitorDetailsInfo } from '../../shared/models/function-monitor';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationInsightsService } from '../../shared/services/application-insights.service';
import { Observable } from 'rxjs/Observable';
import { PortalResources } from '../../shared/models/portal-resources';
import { AIInvocationTraceDetail } from '../../shared/models/application-insights';

@Component({
  selector: ComponentNames.monitorDetails,
  templateUrl: './monitor-details.component.html',
  styleUrls: ['./../function-monitor.component.scss', './monitor-details.component.scss']
})
export class MonitorDetailsComponent extends FeatureComponent<MonitorDetailsInfo> {

  @Input() set monitorDetailsInfoInput(monitorDetailsInfo: MonitorDetailsInfo) {
    this.functionName = this._translateService.instant(PortalResources.loading);
    this.isLoading = true;
    this.setBusy();
    this.setInput(monitorDetailsInfo);
  }

  public functionName: string;
  public operationId: string;
  public monitorDetailsInfo: MonitorDetailsInfo;
  public traceDetail: AIInvocationTraceDetail;
  public isLoading: boolean = true;

  constructor(
    private _translateService: TranslateService,
    private _applicationInsightsService: ApplicationInsightsService,
    injector: Injector
  ) {
    super(ComponentNames.monitorDetails, injector, 'dashboard');
    this.featureName = ComponentNames.functionMonitor;
  }

  protected setup(monitorDetailsInfoInputEvent: Observable<MonitorDetailsInfo>) {
    return monitorDetailsInfoInputEvent
      .switchMap(monitorDetailsInfo => Observable.zip(
        Observable.of(monitorDetailsInfo),
        this._applicationInsightsService.getInvocationTraceDetail(
          monitorDetailsInfo.functionMonitorInfo.applicationInsightsResourceId,
          monitorDetailsInfo.functionMonitorInfo.functionInfo.name,
          monitorDetailsInfo.operationId)
      ))
      .do(tuple => {
        this.isLoading = false;
        this.functionName = tuple[0].functionMonitorInfo.functionInfo.name;
        this.operationId = tuple[0].operationId;
        this.traceDetail = tuple[1];
      })
  }

}
