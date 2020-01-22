import { ScenarioService } from './../shared/services/scenario/scenario.service';
import { ScenarioIds, Constants, LogCategories } from './../shared/models/constants';
import { ComponentNames } from 'app/shared/models/constants';
import { Component, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { ExtendedTreeViewInfo, NavigableComponent } from '../shared/components/navigable-component';
import { GlobalStateService } from '../shared/services/global-state.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionMonitorInfo, MonitorConfigureInfo } from '../shared/models/function-monitor';
import { ErrorEvent } from '../shared/models/error-event';
import { errorIds } from '../shared/models/error-ids';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { PortalResources } from '../shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationInsightsService } from '../shared/services/application-insights.service';
import { SiteService } from '../shared/services/site.service';
import { LogService } from '../shared/services/log.service';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { ApplicationInsight } from 'app/shared/models/application-insights';
import { PortalService } from 'app/shared/services/portal.service';

@Component({
  selector: ComponentNames.functionMonitor,
  templateUrl: './function-monitor.component.html',
  styleUrls: ['./function-monitor.component.scss'],
})
export class FunctionMonitorComponent extends NavigableComponent {
  public static readonly CLASSIC_VIEW = 'classic';

  private _renderComponentName: string = '';
  public functionMonitorInfo: FunctionMonitorInfo;
  public monitorConfigureInfo: MonitorConfigureInfo;
  public renderView = false;

  constructor(
    private _functionAppService: FunctionAppService,
    private _siteService: SiteService,
    private _scenarioService: ScenarioService,
    private _translateService: TranslateService,
    private _applicationInsightsService: ApplicationInsightsService,
    private _logService: LogService,
    private _portalService: PortalService,
    public globalStateService: GlobalStateService,
    injector: Injector
  ) {
    super(ComponentNames.functionMonitor, injector, DashboardType.FunctionMonitorDashboard);
    this.featureName = ComponentNames.functionMonitor;
    this.isParentComponent = true;

    this._broadcastService
      .getEvents<FunctionMonitorInfo>(BroadcastEvent.RefreshMonitoringView)
      .takeUntil(this.ngUnsubscribe)
      .distinctUntilChanged()
      .subscribe(functionMonitorInfo => {
        if (
          this.viewInfo !== null &&
          this.functionMonitorInfo !== null &&
          functionMonitorInfo !== null &&
          this.functionMonitorInfo.functionAppContext.site.id === functionMonitorInfo.functionAppContext.site.id
        ) {
          this.setInput(this.viewInfo);
        }
      });
  }

  protected setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
    return super
      .setup(navigationEvents)
      .switchMap(viewInfo => {
        this.renderView = false;
        return Observable.zip(
          this._functionAppService.getAppContext(viewInfo.siteDescriptor.getTrimmedResourceId()),
          Observable.of(viewInfo)
        );
      })
      .switchMap(tuple =>
        Observable.zip(
          Observable.of(tuple[0]),
          Observable.of(tuple[1].functionDescriptor.name),
          this._siteService.getAppSettings(tuple[0].site.id),
          this._scenarioService.checkScenarioAsync(ScenarioIds.appInsightsConfigurable, { site: tuple[0].site }),
          this._portalService.getAdToken('applicationinsightapi')
        )
      )
      .map(
        (tuple): FunctionMonitorInfo => {
          console.log(tuple);
          return {
            functionAppContext: tuple[0],
            functionAppSettings: tuple[2].result.properties,
            functionName: tuple[1],
            appInsightResourceEnabled: tuple[3].status === 'enabled',
            appInsightResource: tuple[3].status === 'enabled' ? <ArmObj<ApplicationInsight>>tuple[3].data : null,
            appInsightToken: tuple[3].status === 'enabled' && tuple[4].result ? tuple[4].result.token : null,
          };
        }
      )
      .do(functionMonitorInfo => {
        this.functionMonitorInfo = functionMonitorInfo;

        this._renderComponentName = this._shouldLoadClassicView()
          ? ComponentNames.monitorClassic
          : this._shouldLoadApplicationInsightsView()
          ? ComponentNames.monitorApplicationInsights
          : this._loadMonitorConfigureView();

        this.renderView = true;
      });
  }

  get shouldRenderMonitorClassic(): boolean {
    return this._renderComponentName === ComponentNames.monitorClassic;
  }

  get shouldRenderMonitorApplicationInsights(): boolean {
    return this._renderComponentName === ComponentNames.monitorApplicationInsights;
  }

  get shouldRenderMonitorConfigure(): boolean {
    return this._renderComponentName === ComponentNames.monitorConfigure;
  }

  private _shouldLoadClassicView(): boolean {
    const view: string = this._applicationInsightsService.getFunctionMonitorClassicViewPreference(
      this.functionMonitorInfo.functionAppContext.site.id
    );

    const loadClassicView = view === FunctionMonitorComponent.CLASSIC_VIEW && !this._appSettingContainsAppInsightIdentifier();

    if (!loadClassicView) {
      this._applicationInsightsService.removeFunctionMonitorClassicViewPreference(this.functionMonitorInfo.functionAppContext.site.id);
    }

    // NOTE(michinoy): Load the classic view if the app insights feature is not enabled on the environment OR
    // the user has selected to switch to classic view and has not setup an instrumentation key.
    return !this.functionMonitorInfo.appInsightResourceEnabled || loadClassicView;
  }

  private _shouldLoadApplicationInsightsView(): boolean {
    return this.functionMonitorInfo.appInsightResource !== null;
  }

  private _loadMonitorConfigureView(): string {
    let errorEvent: ErrorEvent = null;

    // NOTE(michinoy): Load the if the user has setup an instrumentation key, but the app insights resource was not found
    // in the subscription, present the user with an error message.
    if (this._appSettingContainsAppInsightIdentifier() && this.functionMonitorInfo.appInsightResource === null) {
      errorEvent = {
        errorId: errorIds.applicationInsightsInstrumentationKeyMismatch,
        message: this._translateService.instant(PortalResources.monitoring_appInsightsIsNotFound),
        resourceId: this.functionMonitorInfo.functionAppContext.site.id,
      };

      this._logService.error(
        LogCategories.applicationInsightsKeyNotFound,
        errorIds.applicationInsightsInstrumentationKeyMismatch,
        'Application Insights Instrumentation Key not found'
      );
    }

    this.monitorConfigureInfo = {
      functionMonitorInfo: this.functionMonitorInfo,
      errorEvent: errorEvent,
    };

    return ComponentNames.monitorConfigure;
  }

  private _appSettingContainsAppInsightIdentifier(): boolean {
    const instrumentationKeyExists = !!this.functionMonitorInfo.functionAppSettings[Constants.instrumentationKeySettingName];
    const connectionStringExists = !!this.functionMonitorInfo.functionAppSettings[Constants.connectionStringSettingName];

    return instrumentationKeyExists || connectionStringExists;
  }
}
