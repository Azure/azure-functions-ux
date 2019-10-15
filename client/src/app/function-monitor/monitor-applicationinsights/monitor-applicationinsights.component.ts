import { ArmResourceDescriptor } from './../../shared/resourceDescriptors';
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
import { FunctionAppContext } from 'app/shared/function-app-context';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';

@Component({
  selector: ComponentNames.monitorApplicationInsights,
  templateUrl: './monitor-applicationinsights.component.html',
  styleUrls: ['./../function-monitor.component.scss', './monitor-applicationinsights.component.scss'],
})
export class MonitorApplicationInsightsComponent extends FeatureComponent<FunctionMonitorInfo> {
  @Input()
  set functionMonitorInfoInput(functionMonitorInfo: FunctionMonitorInfo) {
    this.isLoading = true;
    this.successCount = '0';
    this.errorsCount = '0';
    this.applicationInsightsInstanceName = this._translateService.instant(PortalResources.loading);
    this.monitorDetailsInfo = null;
    this.sidePanelOpened = false;
    this.selectedRowId = null;
    this.appInsightsQueryReturnedTitle = this._translateService.instant(PortalResources.loading);
    this.showDelayWarning = false;
    this.functionMonitorInfo = functionMonitorInfo;
    this.componentId = `${functionMonitorInfo.functionAppContext.site.id}/functions/${functionMonitorInfo.functionName}/monitor`;
    this.setInput(functionMonitorInfo);
  }

  public successCount: string;
  public errorsCount: string;
  public applicationInsightsInstanceName: string;
  public functionMonitorInfo: FunctionMonitorInfo;
  public invocationTraces: AIInvocationTrace[] = [];
  public isLoading = true;
  public monitorDetailsInfo: MonitorDetailsInfo;
  public sidePanelOpened = false;
  public selectedRowId: string;
  public showDelayWarning = false;
  public appInsightsQueryReturnedTitle: string;
  public componentId: string;
  public applicationInsightsAppId: string;

  constructor(
    private _portalService: PortalService,
    private _translateService: TranslateService,
    private _applicationInsightsService: ApplicationInsightsService,
    injector: Injector
  ) {
    super(ComponentNames.monitorApplicationInsights, injector, 'dashboard');
    this.featureName = ComponentNames.functionMonitor;
  }

  protected setup(functionMonitorInfoInputEvent: Observable<FunctionMonitorInfo>) {
    return functionMonitorInfoInputEvent
      .switchMap(functionMonitorInfo => {
        const functionAppName = this._getFunctionAppName(functionMonitorInfo.functionAppContext);

        return Observable.zip(
          this._applicationInsightsService.getLast30DaySummary(
            functionMonitorInfo.appInsightResource.properties.AppId,
            functionMonitorInfo.appInsightToken,
            functionAppName,
            functionMonitorInfo.functionName
          ),
          this._applicationInsightsService.getInvocationTraces(
            functionMonitorInfo.appInsightResource.properties.AppId,
            functionMonitorInfo.appInsightToken,
            functionAppName,
            functionMonitorInfo.functionName
          )
        );
      })
      .do(responses => {
        const monthlySummary = responses[0];
        this.invocationTraces = responses[1];
        this.applicationInsightsInstanceName = this.functionMonitorInfo.appInsightResource.name;
        this.appInsightsQueryReturnedTitle = this._translateService
          .instant(PortalResources.functionMonitor_appInsightsQueryReturnedTitle)
          .format(this.invocationTraces.length);

        this.successCount = monthlySummary.successCount.toString();
        this.errorsCount = monthlySummary.failedCount.toString();
        this.showDelayWarning = this.showDelayWarning || this.invocationTraces.length === 0;
        this.isLoading = false;
      });
  }

  public showTraceHistory(trace: AIInvocationTrace): void {
    this.sidePanelOpened = false;
    this.selectedRowId = trace.operationId;
    this.monitorDetailsInfo = {
      functionMonitorInfo: this.functionMonitorInfo,
      operationId: trace.operationId,
      id: trace.id,
      invocationId: trace.invocationId,
    };
    this.sidePanelOpened = true;
  }

  public closeSidePanel() {
    this.sidePanelOpened = false;
    this.selectedRowId = null;
  }

  public refresh() {
    this.sidePanelOpened = false;
    this.showDelayWarning = true;
    this.setInput(this.functionMonitorInfo);
  }

  public openAppMetrics() {
    const descriptor = new ArmResourceDescriptor(this.functionMonitorInfo.appInsightResource.id);

    this._portalService.openBlade(
      {
        detailBlade: 'QuickPulseBladeV2',
        detailBladeInputs: {
          ComponentId: {
            Name: descriptor.resourceName,
            SubscriptionId: descriptor.subscription,
            ResourceGroup: descriptor.resourceGroup,
          },
          ResourceId: descriptor.resourceId,
        },
        extension: 'AppInsightsExtension',
      },
      ComponentNames.functionMonitor
    );
  }

  public openInAppInsights() {
    this._portalService.openBlade(
      {
        detailBlade: 'AspNetOverviewV3',
        detailBladeInputs: {
          id: this.functionMonitorInfo.appInsightResource.id,
        },
        extension: 'AppInsightsExtension',
      },
      ComponentNames.functionMonitor
    );
  }

  public openAppInsightsQueryEditor() {
    this._portalService.openBlade(
      this._applicationInsightsService.getInvocationTracesBladeParameters(
        this.functionMonitorInfo.appInsightResource.id,
        this._getFunctionAppName(this.functionMonitorInfo.functionAppContext),
        this.functionMonitorInfo.functionName
      ),
      ComponentNames.functionMonitor
    );
  }

  public openDiagnoseAndSolveProblemsBlade() {
    this._portalService.openFrameBlade(
      {
        detailBlade: 'SCIFrameBlade',
        detailBladeInputs: {
          id: this.functionMonitorInfo.functionAppContext.site.id,
        },
      },
      ComponentNames.functionMonitor
    );
  }

  private _getFunctionAppName(functionAppContext: FunctionAppContext): string {
    const siteDescriptor: ArmSiteDescriptor = new ArmSiteDescriptor(functionAppContext.site.id);

    return siteDescriptor.slot ? `${siteDescriptor.site}-${siteDescriptor.slot}` : siteDescriptor.site;
  }
}
