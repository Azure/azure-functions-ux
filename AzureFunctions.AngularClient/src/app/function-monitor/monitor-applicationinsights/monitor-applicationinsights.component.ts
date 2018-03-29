import { Component, Input, Injector } from '@angular/core';
import { ComponentNames } from '../../shared/models/constants';
import { FeatureComponent } from '../../shared/components/feature-component';
import { FunctionMonitorInfo, MonitorDetailsInfo } from '../../shared/models/function-monitor';
import { Observable } from 'rxjs/Observable';
import { ApplicationInsightsService } from '../../shared/services/application-insights.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { AIInvocationTrace } from '../../shared/models/application-insights';
import { PortalService } from '../../shared/services/portal.service';

declare const moment: any;

@Component({
  selector: ComponentNames.monitorApplicationInsights,
  templateUrl: './monitor-applicationinsights.component.html',
  styleUrls: ['./../function-monitor.component.scss', './monitor-applicationinsights.component.scss']
})

export class MonitorApplicationInsightsComponent extends FeatureComponent<FunctionMonitorInfo> {

  @Input() set functionMonitorInfoInput(functionMonitorInfo: FunctionMonitorInfo) {
    this.isLoading = true;
    this.successCount = this._translateService.instant(PortalResources.loading);
    this.errorsCount = this._translateService.instant(PortalResources.loading);
    this.applicationInsightsInstanceName = this._translateService.instant(PortalResources.loading);
    this.monitorDetailsInfo = null;
    this.sidePanelOpened = false;
    this.setBusy();
    this.setInput(functionMonitorInfo);
  }

  public successCountHeading: string;
  public errorsCountHeading: string;
  public successCount: string;
  public errorsCount: string;
  public applicationInsightsInstanceName: string;
  public functionMonitorInfo: FunctionMonitorInfo;
  public invocationTraces: AIInvocationTrace[] = [];
  public isLoading: boolean = true;
  public monitorDetailsInfo: MonitorDetailsInfo;
  public sidePanelOpened: boolean = false;

  constructor(
    private _portalService: PortalService,
    private _translateService: TranslateService,
    private _applicationInsightsService: ApplicationInsightsService,
    injector: Injector) {
    super(ComponentNames.monitorApplicationInsights, injector, 'dashboard');
    this.featureName = ComponentNames.functionMonitor;
    this._setHeaders();
  }

  protected setup(functionMonitorInfoInputEvent: Observable<FunctionMonitorInfo>) {
    return functionMonitorInfoInputEvent
      .switchMap(functionMonitorInfo => Observable.zip(
        Observable.of(functionMonitorInfo),
        this._applicationInsightsService.getCurrentMonthSummary(functionMonitorInfo.applicationInsightsResourceId, functionMonitorInfo.functionInfo.name),
        this._applicationInsightsService.getInvocationTraces(functionMonitorInfo.applicationInsightsResourceId, functionMonitorInfo.functionInfo.name)
      ))
      .do(tuple => {
        this.functionMonitorInfo = tuple[0];
        this.invocationTraces = tuple[2];

        const monthlySummary = tuple[1];
        const applicationInsightsResourceIdParts = this.functionMonitorInfo.applicationInsightsResourceId.split('/');
        this.applicationInsightsInstanceName = applicationInsightsResourceIdParts[applicationInsightsResourceIdParts.length - 1];

        this.successCount = monthlySummary.successCount.toString();
        this.errorsCount = monthlySummary.failedCount.toString();
        this.isLoading = false;
      });
  }

  public showTraceDetail(trace: AIInvocationTrace): void {
    this.sidePanelOpened = true;
    this.monitorDetailsInfo = {
      functionMonitorInfo: this.functionMonitorInfo,
      operationId: trace.operationId,
      id: trace.id
    }
  }

  public closeSidePanel() {
      this.sidePanelOpened = false;
  }

  public refresh() {
    this.sidePanelOpened = false;
    this.setInput(this.functionMonitorInfo);
  }

  public openInAppInsights() {
    this._portalService.openBlade(
      {
          detailBlade: 'AspNetOverview',
          detailBladeInputs: {
              id: this.functionMonitorInfo.applicationInsightsResourceId
          },
          extension: 'AppInsightsExtension'
      },
      ComponentNames.functionMonitor);
  }

  public openAppInsightsQueryEditor() {
    var url = this._applicationInsightsService.getInvocationTracesDirectUrl(
      this.functionMonitorInfo.applicationInsightsResourceId,
      this.functionMonitorInfo.functionInfo.name);

    window.open(url, '_blank');
  }

  private _setHeaders(): void {
    const firstOfMonth = moment().startOf('month');
    this.successCountHeading = `${this._translateService.instant(PortalResources.functionMonitor_successAggregate)} ${firstOfMonth.format('MMM Do')}`;
    this.errorsCountHeading = `${this._translateService.instant(PortalResources.functionMonitor_errorsAggregate)} ${firstOfMonth.format('MMM Do')}`;
  }

}
