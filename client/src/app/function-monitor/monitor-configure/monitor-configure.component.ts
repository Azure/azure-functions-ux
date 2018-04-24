import { Component, Input, Injector } from '@angular/core';
import { ComponentNames, LogCategories } from '../../shared/models/constants';
import { FeatureComponent } from '../../shared/components/feature-component';
import { MonitorConfigureInfo, FunctionMonitorInfo } from '../../shared/models/function-monitor';
import { Observable } from 'rxjs/Observable';
import { ErrorEvent } from '../../shared/models/error-event';
import { errorIds } from '../../shared/models/error-ids';
import { FunctionMonitorComponent } from '../function-monitor.component';
import { BroadcastEvent } from '../../shared/models/broadcast-event';
import { PortalService } from '../../shared/services/portal.service';
import { LogService } from '../../shared/services/log.service';
import { ApplicationInsightsService } from '../../shared/services/application-insights.service';

@Component({
  selector: ComponentNames.monitorConfigure,
  templateUrl: './monitor-configure.component.html',
  styleUrls: ['./../function-monitor.component.scss', './monitor-configure.component.scss']
})

export class MonitorConfigureComponent extends FeatureComponent<MonitorConfigureInfo> {

  @Input() set monitorConfigureInfoInput(monitorConfigureInfo: MonitorConfigureInfo) {
    this.enableConfigureButton = false;
    this.allowSwitchToClassic = false;
    this.setInput(monitorConfigureInfo);
  }

  private _functionMonitorInfo: FunctionMonitorInfo;
  private _errorEvent: ErrorEvent;
  public enableConfigureButton = false;
  public allowSwitchToClassic = false;

  constructor(
    private _logService: LogService,
    private _applicationInsightsService: ApplicationInsightsService,
    private _portalService: PortalService,
    injector: Injector
  ) {
    super(ComponentNames.monitorConfigure, injector, 'dashboard');
    this.featureName = ComponentNames.functionMonitor;
  }

  protected setup(monitorConfigureInfoInputEvent: Observable<MonitorConfigureInfo>) {
    return monitorConfigureInfoInputEvent
      .do(monitorConfigureInfo => {
        this._functionMonitorInfo = monitorConfigureInfo.functionMonitorInfo;
        this._errorEvent = monitorConfigureInfo.errorEvent;
        this._setupConfigureButton();
        this._setupSwitchToClassicButton();
        if (this._errorEvent) {
          this.showComponentError(this._errorEvent);
        }
      });
  }

  public switchToClassicView() {
    this._applicationInsightsService.setFunctionMonitorClassicViewPreference(this._functionMonitorInfo.functionAppContext.site.id, FunctionMonitorComponent.CLASSIC_VIEW);
    this._broadcastService.broadcastEvent<FunctionMonitorInfo>(BroadcastEvent.RefreshMonitoringView, this._functionMonitorInfo);
  }

  public refresh() {
    this._broadcastService.broadcastEvent<FunctionMonitorInfo>(BroadcastEvent.RefreshMonitoringView, this._functionMonitorInfo);
  }

  public configure() {
    const appInsightBladeInput = {
      detailBlade: 'AppServicesEnablementBlade',
      detailBladeInputs: {
          resourceUri: this._functionMonitorInfo.functionAppContext.site.id,
          linkedComponent: null
      },
      extension: 'AppInsightsExtension'
    };

    this._portalService
      .openBlade(appInsightBladeInput, ComponentNames.functionMonitor)
      .subscribe(result => {
        this.refresh();
      }, err => {
        this._logService.error(LogCategories.applicationInsightsConfigure, errorIds.applicationInsightsConfigure, err);
      });
  }

  private _setupConfigureButton() {
    this.enableConfigureButton =
      !this._errorEvent ||
      this._errorEvent.errorId === errorIds.preconditionsErrors.clientCertEnabled;
  }

  private _setupSwitchToClassicButton() {
    this.allowSwitchToClassic =
      !this._errorEvent ||
      (this._errorEvent.errorId !== errorIds.preconditionsErrors.clientCertEnabled &&
      this._errorEvent.errorId !== errorIds.applicationInsightsInstrumentationKeyMismatch);
  }

}
