import { TelemetryService } from './services/telemetry.service';
import { PortalService } from 'app/shared/services/portal.service';
import { Injector } from '@angular/core';
import { TabComponent } from './../controls/tabs/tab/tab.component';
import { ArmEmbeddedService } from './services/arm-embedded.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { IsDirtyDirective } from './directives/is-dirty.directive';
import { LoadImageDirective } from './../controls/load-image/load-image.directive';
import { SlideToggleComponent } from './../controls/slide-toggle/slide-toggle.component';
import { TooltipDirective } from './../tooltip-content/tooltip.directive';
import { TooltipContentComponent } from './../tooltip-content/tooltip-content.component';
import { TopBarStandAloneLoginUserComponent } from './../top-bar-standalone-loginuser/top-bar-standalone-loginuser.component';
import { GlobalErrorHandler } from './GlobalErrorHandler';
import { GlobalStateService } from './services/global-state.service';
import { BackgroundTasksService } from './services/background-tasks.service';
import { UtilitiesService } from './services/utilities.service';
import { LocalStorageService } from './services/local-storage.service';
import { AuthzService } from './services/authz.service';
import { ScenarioService } from './services/scenario/scenario.service';
import { CacheService } from 'app/shared/services/cache.service';
import { LogService } from './services/log.service';
import { FunctionMonitorService } from './services/function-monitor.service';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { LanguageService } from './services/language.service';
import { TryFunctionsService } from './services/try-functions.service';
import { ConfigService } from 'app/shared/services/config.service';
import { SearchBoxComponent } from './../search-box/search-box.component';
import { CopyPreComponent } from './../copy-pre/copy-pre.component';
import { ClickToEditComponent } from './../controls/click-to-edit/click-to-edit.component';
import { TextboxComponent } from './../controls/textbox/textbox.component';
import { PopOverComponent } from './../pop-over/pop-over.component';
import { RadioSelectorComponent } from './../radio-selector/radio-selector.component';
import { DynamicLoaderDirective } from './directives/dynamic-loader.directive';
import { CheckScenarioDirective } from './directives/check-scenario.directive';
import { CommandComponent } from './../controls/command-bar/command/command.component';
import { CommandBarComponent } from './../controls/command-bar/command-bar.component';
import { TblThComponent } from './../controls/tbl/tbl-th/tbl-th.component';
import { TblComponent } from './../controls/tbl/tbl.component';
import { DropDownComponent } from './../drop-down/drop-down.component';
import { MultiDropDownComponent } from './../multi-drop-down/multi-drop-down.component';
import { BusyStateComponent } from './../busy-state/busy-state.component';
import { TopBarComponent } from './../top-bar/top-bar.component';
import { AiTryService } from './services/ai-try.service';
import { ArmTryService } from './services/arm-try.service';
import { AiService } from './services/ai.service';
import { UserService } from './services/user.service';
import { Http } from '@angular/http';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders, ErrorHandler } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ArmService } from 'app/shared/services/arm.service';
import { Url } from 'app/shared/Utilities/url';
import { EmptyDashboardComponent } from 'app/main/empty-dashboard.component';
import { InfoBoxComponent } from './../controls/info-box/info-box.component';
import { LogMessageDirective } from 'app/shared/directives/log-message.directive';
import { TableCellComponent } from './../controls/table-cell/table-cell.component';
import { TableRowComponent } from './../controls/table-row/table-row.component';
import { TableRootComponent } from './../controls/table-root/table-root.component';
import { DeletedItemsFilter } from './../controls/table-root/deleted-items-filter.pipe';
import { ActivateWithKeysDirective } from './../controls/activate-with-keys/activate-with-keys.directive';
import { EmbeddedService } from 'app/shared/services/embedded.service';
import { SiteService } from 'app/shared/services/site.service';
import { CardInfoControlComponent } from '../controls/card-info-control/card-info-control.component';
import { PlanService } from './services/plan.service';
import { AseService } from './services/ase.service';
import { BillingService } from './services/billing.service';
import { ApplicationInsightsService } from './services/application-insights.service';
import { InvalidmessageDirective } from './directives/invalid-control-message.directive';
import { NgUploaderModule } from 'ngx-uploader';
import { FlexListDirective } from '../controls/flex-list/flex-list.directive';
import { QuotaService } from './services/quota.service';
import { RemoveSpacesPipe } from './pipes/remove-spaces.pipe';
import { MarkdownModule } from 'ngx-markdown';
import { GroupTabsComponent } from '../controls/group-tabs/group-tabs.component';
import { FunctionService } from './services/function.service';
import { SubscriptionService } from './services/subscription.service';
import { RuntimeStackService } from './services/runtimestack.service';

export function ArmServiceFactory(
  http: Http,
  userService: UserService,
  portalService: PortalService,
  aiService: AiService,
  injector: Injector
) {
  if (Url.getParameterByName(null, 'trial') === 'true') {
    return new ArmTryService(http, userService, portalService, aiService);
  } else if (Url.getParameterByName(null, 'appsvc.embedded') === 'functions') {
    return new ArmEmbeddedService(http, userService, aiService, portalService);
  } else {
    return new ArmService(http, userService, portalService, aiService);
  }
}

export function AiServiceFactory() {
  const service = Url.getParameterByName(null, 'trial') === 'true' ? new AiTryService() : new AiService();
  return service;
}

@NgModule({
  declarations: [
    TopBarComponent,
    TopBarStandAloneLoginUserComponent,
    BusyStateComponent,
    MultiDropDownComponent,
    DropDownComponent,
    TblComponent,
    TblThComponent,
    CommandBarComponent,
    CommandComponent,
    CheckScenarioDirective,
    DynamicLoaderDirective,
    LogMessageDirective,
    IsDirtyDirective,
    RadioSelectorComponent,
    PopOverComponent,
    TextboxComponent,
    ClickToEditComponent,
    CopyPreComponent,
    SearchBoxComponent,
    TooltipContentComponent,
    TooltipDirective,
    SlideToggleComponent,
    LoadImageDirective,
    EmptyDashboardComponent,
    InfoBoxComponent,
    TableCellComponent,
    TableRowComponent,
    TableRootComponent,
    DeletedItemsFilter,
    TabComponent,
    ActivateWithKeysDirective,
    CardInfoControlComponent,
    InvalidmessageDirective,
    FlexListDirective,
    RemoveSpacesPipe,
    GroupTabsComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MultiDropDownComponent,
    TopBarComponent,
    TopBarStandAloneLoginUserComponent,
    BusyStateComponent,
    DropDownComponent,
    TblComponent,
    TblThComponent,
    CommandBarComponent,
    CommandComponent,
    CheckScenarioDirective,
    DynamicLoaderDirective,
    LogMessageDirective,
    IsDirtyDirective,
    RadioSelectorComponent,
    PopOverComponent,
    TextboxComponent,
    ClickToEditComponent,
    CopyPreComponent,
    SearchBoxComponent,
    TooltipContentComponent,
    TooltipDirective,
    SlideToggleComponent,
    LoadImageDirective,
    EmptyDashboardComponent,
    InfoBoxComponent,
    TableCellComponent,
    TableRowComponent,
    TableRootComponent,
    DeletedItemsFilter,
    TabComponent,
    ActivateWithKeysDirective,
    CardInfoControlComponent,
    InvalidmessageDirective,
    NgUploaderModule,
    FlexListDirective,
    RemoveSpacesPipe,
    GroupTabsComponent,
  ],
  imports: [FormsModule, CommonModule, ReactiveFormsModule, TranslateModule.forChild(), NgUploaderModule, MarkdownModule.forRoot()],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        ConfigService,
        TryFunctionsService,
        FunctionAppService,
        UserService,
        LanguageService,
        PortalService,
        BroadcastService,
        FunctionMonitorService,
        FormBuilder,
        LogService,
        {
          provide: ArmService,
          useFactory: ArmServiceFactory,
          deps: [Http, UserService, PortalService, AiService, Injector],
        },
        CacheService,
        ScenarioService,
        AuthzService,
        LocalStorageService,
        UtilitiesService,
        BackgroundTasksService,
        GlobalStateService,
        EmbeddedService,
        SiteService,
        PlanService,
        AseService,
        BillingService,
        TelemetryService,
        { provide: AiService, useFactory: AiServiceFactory },
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        ApplicationInsightsService,
        QuotaService,
        FunctionService,
        SubscriptionService,
        RuntimeStackService,
      ],
    };
  }
}
