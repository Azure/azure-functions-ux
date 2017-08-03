import { SiteTabComponent } from './site/site-dashboard/site-tab/site-tab.component';
import { DynamicLoaderDirective } from './shared/directives/dynamic-loader.directive';
import { DownloadFunctionAppContentComponent } from './download-function-app-content/download-function-app-content.component';
import { CreateAppComponent } from './site/create-app/create-app.component';
import { ClickToEditComponent } from './controls/click-to-edit/click-to-edit.component';
import { AiTryService } from './shared/services/ai-try.service';
import { TblThComponent } from './controls/tbl/tbl-th/tbl-th.component';
import { TblComponent } from './controls/tbl/tbl.component';
import { GlobalErrorHandler } from './shared/GlobalErrorHandler';
import { ErrorHandler } from '@angular/core';
import { ArmTryService } from './shared/services/arm-try.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';

import { TranslateModule } from '@ngx-translate/core';
import { FileUploadModule } from 'ng2-file-upload';
import { PopoverModule } from "ng2-popover";

import { ConfigService } from './shared/services/config.service';
import { FunctionsService } from './shared/services/functions.service';
import { UserService } from './shared/services/user.service';
import { PortalService } from './shared/services/portal.service';
import { BroadcastService } from './shared/services/broadcast.service';
import { FunctionMonitorService } from './shared/services/function-monitor.service';
import { ArmService } from './shared/services/arm.service';
import { CacheService } from './shared/services/cache.service';
import { AuthzService } from './shared/services/authz.service';
import { LocalStorageService } from './shared/services/local-storage.service';
import { TelemetryService } from './shared/services/telemetry.service';
import { UtilitiesService } from './shared/services/utilities.service';
import { BackgroundTasksService } from './shared/services/background-tasks.service';
import { GlobalStateService } from './shared/services/global-state.service';
import { AiService } from './shared/services/ai.service';
import { LanguageService } from './shared/services/language.service';

import { AppComponent } from './app.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { BusyStateComponent } from './busy-state/busy-state.component';
import { TryNowBusyStateComponent } from './try-now-busy-state/try-now-busy-state.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { DropDownComponent } from './drop-down/drop-down.component';
import { TryNowComponent } from './try-now/try-now.component';
import { FunctionEditComponent } from './function-edit/function-edit.component';
import { TrialExpiredComponent } from './trial-expired/trial-expired.component';
import { FunctionNewComponent } from './function-new/function-new.component';
import { FunctionQuickstartComponent } from './function-quickstart/function-quickstart.component';
import { TutorialComponent } from './tutorial/tutorial.component';
import { SourceControlComponent } from './source-control/source-control.component';
import { FunctionDevComponent } from './function-dev/function-dev.component';
import { BindingComponent } from './binding/binding.component';
import { TooltipContentComponent } from './tooltip-content/tooltip-content.component';
import { TooltipDirective } from './tooltip-content/tooltip.directive';
import { ErrorListComponent } from './error-list/error-list.component';
import { TemplatePickerComponent } from './template-picker/template-picker.component';
import { PopOverComponent } from './pop-over/pop-over.component';
import { BindingInputComponent } from './binding-input/binding-input.component';
import { BindingDesignerComponent } from './binding-designer/binding-designer.component';
import { SecretsBoxContainerComponent } from './secrets-box-container/secrets-box-container.component';
import { SecretsBoxInputDirective } from './secrets-box-container/secrets-box-input.directive';
import { AggregateBlockComponent } from './aggregate-block/aggregate-block.component';
import { CopyPreComponent } from './copy-pre/copy-pre.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { FunctionIntegrateV2Component } from './function-integrate-v2/function-integrate-v2.component';
import { FunctionIntegrateComponent } from './function-integrate/function-integrate.component';
import { FunctionKeysComponent } from './function-keys/function-keys.component';
import { FunctionManageComponent } from './function-manage/function-manage.component';
import { FunctionMonitorComponent } from './function-monitor/function-monitor.component';
import { LogStreamingComponent } from './log-streaming/log-streaming.component';
import { RadioSelectorComponent } from './radio-selector/radio-selector.component';
import { RunHttpComponent } from './run-http/run-http.component';
import { TableFunctionMonitorComponent } from './table-function-monitor/table-function-monitor.component';
import { TryLandingComponent } from './try-landing/try-landing.component';
import { AggregateBlockPipe } from './aggregate-block/aggregate-block.pipe';
import { MonacoEditorDirective } from './shared/directives/monaco-editor.directive';
import { TableFunctionMonitorPipe } from './table-function-monitor/table-function-monitor.pipe';
import { MainComponent } from './main/main.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { TreeViewComponent } from './tree-view/tree-view.component';
import { SiteDashboardComponent } from './site/site-dashboard/site-dashboard.component';
import { TabsComponent } from './tabs/tabs.component';
import { TabComponent } from './tab/tab.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { SiteSummaryComponent } from './site/site-summary/site-summary.component';
import { SiteEnabledFeaturesComponent } from './site/site-enabled-features/site-enabled-features.component';
import { SiteManageComponent } from './site/site-manage/site-manage.component';
import { FeatureGroupComponent } from './feature-group/feature-group.component';
import { DeploymentSourceComponent } from './site/deployment-source/deployment-source.component';
import { DeploymentSourceSetupComponent } from './site/deployment-source-setup/deployment-source-setup.component';
import { MultiDropDownComponent } from './multi-drop-down/multi-drop-down.component';
import { TopRightMenuComponent } from './top-right-menu/top-right-menu.component';
import { AppsListComponent } from './apps-list/apps-list.component';
import { FunctionRuntimeComponent } from './site/function-runtime/function-runtime.component';
import { ApiDetailsComponent } from './api-details/api-details.component';
import { ApiNewComponent } from './api-new/api-new.component';
import { FunctionsListComponent } from './functions-list/functions-list.component';
import { ProxiesListComponent } from './proxies-list/proxies-list.component';
import { DisabledDashboardComponent } from './disabled-dashboard/disabled-dashboard.component';
import { CreateFunctionWrapperComponent } from './create-function-wrapper/create-function-wrapper.component';
import { SwaggerDefinitionComponent } from './site/swagger-definition/swagger-definition.component';
import { SwaggerFrameDirective } from './site/swagger-frame/swagger-frame.directive';
import { FnWriteAccessDirective } from './shared/directives/fn-write-access.directive';
import { EditModeWarningComponent } from './edit-mode-warning/edit-mode-warning.component';
import { TextboxComponent } from './controls/textbox/textbox.component';
import { SiteConfigComponent } from './site/site-config/site-config.component';
import { SiteConfigStandaloneComponent } from './site/site-config-standalone/site-config-standalone.component';
import { CommandBarComponent } from './controls/command-bar/command-bar.component';
import { CommandComponent } from './controls/command-bar/command/command.component';
import { EventHubComponent } from './pickers/event-hub/event-hub.component';
import { ServiceBusComponent } from './pickers/service-bus/service-bus.component';
import { SlotsListComponent } from './slots-list/slots-list.component';
import { SlotsService } from './shared/services/slots.service';
import { SlotNewComponent } from './slot-new/slot-new.component';
import { SearchBoxComponent } from './search-box/search-box.component';
import { AppSettingComponent } from './pickers/app-setting/app-setting.component';
import { GeneralSettingsComponent } from './site/site-config/general-settings/general-settings.component';
import { AppSettingsComponent } from './site/site-config/app-settings/app-settings.component';
import { ConnectionStringsComponent } from './site/site-config/connection-strings/connection-strings.component';
import { BindingEventGridComponent } from './binding-event-grid/binding-event-grid.component';

export function ArmServiceFactory(
  http: Http,
  userService: UserService,
  aiService: AiService) {
  const service = window.location.pathname.toLowerCase() === '/try' ?
    new ArmTryService(http, userService, aiService) :
    new ArmService(http, userService, aiService);

  return service;
}

export function AiServiceFactory() {
  const service = window.location.pathname.toLowerCase() === '/try' ? new AiTryService() : new AiService();
  return service;
}

@NgModule(AppModule.moduleDefinition)
export class AppModule {
  static moduleDefinition = {
    entryComponents: [
      SiteSummaryComponent,
      SiteManageComponent,
      FunctionRuntimeComponent,
      SwaggerDefinitionComponent,
      SiteConfigComponent,
      SiteConfigStandaloneComponent
    ],
    declarations: [
      AppComponent,
      GettingStartedComponent,
      BusyStateComponent,
      TryNowBusyStateComponent,
      TopBarComponent,
      DropDownComponent,
      TryNowComponent,
      FunctionEditComponent,
      TrialExpiredComponent,
      FunctionNewComponent,
      FunctionQuickstartComponent,
      TutorialComponent,
      SourceControlComponent,
      FunctionDevComponent,
      BindingComponent,
      TooltipContentComponent,
      TooltipDirective,
      ErrorListComponent,
      TemplatePickerComponent,
      PopOverComponent,
      BindingInputComponent,
      BindingDesignerComponent,
      SecretsBoxContainerComponent,
      SecretsBoxInputDirective,
      AggregateBlockComponent,
      CopyPreComponent,
      FileExplorerComponent,
      FunctionIntegrateV2Component,
      FunctionIntegrateComponent,
      FunctionKeysComponent,
      FunctionManageComponent,
      FunctionMonitorComponent,
      LogStreamingComponent,
      RadioSelectorComponent,
      RunHttpComponent,
      TableFunctionMonitorComponent,
      TryLandingComponent,
      AggregateBlockPipe,
      MonacoEditorDirective,
      TableFunctionMonitorPipe,
      MainComponent,
      SideNavComponent,
      TreeViewComponent,
      SiteDashboardComponent,
      SiteTabComponent,
      TabsComponent,
      TabComponent,
      BreadcrumbsComponent,
      SiteSummaryComponent,
      SiteEnabledFeaturesComponent,
      SiteManageComponent,
      FeatureGroupComponent,
      DeploymentSourceComponent,
      DeploymentSourceSetupComponent,
      MultiDropDownComponent,
      TopRightMenuComponent,
      AppsListComponent,
      FunctionRuntimeComponent,
      ApiDetailsComponent,
      ApiNewComponent,
      FunctionsListComponent,
      ProxiesListComponent,
      SlotsListComponent,
      SwaggerDefinitionComponent,
      SwaggerFrameDirective,
      DisabledDashboardComponent,
      CreateFunctionWrapperComponent,
      TblComponent,
      TblThComponent,
      FnWriteAccessDirective,
      DynamicLoaderDirective,
      EditModeWarningComponent,
      TextboxComponent,
      SiteConfigComponent,
      SiteConfigStandaloneComponent,
      ClickToEditComponent,
      CommandBarComponent,
      CommandComponent,
      CreateAppComponent,
      SlotsListComponent,
      SlotNewComponent,
      EventHubComponent,
      ServiceBusComponent,
      SearchBoxComponent,
      AppSettingComponent,
      DownloadFunctionAppContentComponent,
      GeneralSettingsComponent,
      AppSettingsComponent,
      ConnectionStringsComponent,
      BindingEventGridComponent
    ],
    imports: [
      FormsModule,
      ReactiveFormsModule,
      BrowserModule,
      FormsModule,
      HttpModule,
      TranslateModule.forRoot(),
      FileUploadModule,
      PopoverModule
    ],
    providers: [
      ConfigService,
      FunctionsService,
      UserService,
      LanguageService,
      PortalService,
      BroadcastService,
      FunctionMonitorService,
      {
        provide: ArmService, useFactory: ArmServiceFactory, deps: [
          Http,
          UserService,
          AiService
        ]
      },
      CacheService,
      SlotsService,
      AuthzService,
      LocalStorageService,
      TelemetryService,
      UtilitiesService,
      BackgroundTasksService,
      GlobalStateService,
      { provide: AiService, useFactory: AiServiceFactory },
      { provide: ErrorHandler, useClass: GlobalErrorHandler },
    ],
    bootstrap: [AppComponent]
  };
}
