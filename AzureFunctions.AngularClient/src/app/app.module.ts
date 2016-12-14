import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import {TranslateModule} from 'ng2-translate';
import { nvD3 } from 'ng2-nvd3';
import {FileSelectDirective, FileDropDirective, FileUploader} from 'ng2-file-upload/ng2-file-upload';

import {FunctionsService} from './shared/services/functions.service';
import {UserService} from './shared/services/user.service';
import {PortalService} from './shared/services/portal.service';
import {BroadcastService} from './shared/services/broadcast.service';
import {FunctionMonitorService} from './shared/services/function-monitor.service'
import {ArmService} from './shared/services/arm.service';
import {MonitoringService} from './shared/services/app-monitoring.service';
import {TelemetryService} from './shared/services/telemetry.service';
import {UtilitiesService} from './shared/services/utilities.service';
import {BackgroundTasksService} from './shared/services/background-tasks.service';
import {GlobalStateService} from './shared/services/global-state.service';
import {AiService} from './shared/services/ai.service';

import { AppComponent } from './app.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { BusyStateComponent } from './busy-state/busy-state.component';
import { LocalDevelopmentInstructionsComponent } from './local-development-instructions/local-development-instructions.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TryNowBusyStateComponent } from './try-now-busy-state/try-now-busy-state.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { DropDownComponent } from './drop-down/drop-down.component';
import { TryNowComponent } from './try-now/try-now.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SidebarPipe } from './sidebar/pipes/sidebar.pipe';
import { FunctionEditComponent } from './function-edit/function-edit.component';
import { AppMonitoringComponent } from './app-monitoring/app-monitoring.component';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { TrialExpiredComponent } from './trial-expired/trial-expired.component';
import { FunctionNewComponent } from './function-new/function-new.component';
import { IntroComponent } from './intro/intro.component';
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
import { FunctionDesignerComponent } from './function-designer/function-designer.component';
import { MonacoEditorDirective } from './shared/directives/monaco-editor.directive';
import { TableFunctionMonitorPipe } from './table-function-monitor/table-function-monitor.pipe';

@NgModule({
  declarations: [
      AppComponent,
      nvD3,
      FileSelectDirective,
      FileDropDirective,      

      GettingStartedComponent,
      BusyStateComponent,
      LocalDevelopmentInstructionsComponent,
      DashboardComponent,
      TryNowBusyStateComponent,
      TopBarComponent,
      DropDownComponent,
      TryNowComponent,
      SidebarComponent,
      SidebarPipe,
      FunctionEditComponent,
      AppMonitoringComponent,
      AppSettingsComponent,
      TrialExpiredComponent,
      FunctionNewComponent,
      IntroComponent,
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
      FunctionDesignerComponent,
      MonacoEditorDirective,
      TableFunctionMonitorPipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
      HttpModule,
      TranslateModule.forRoot()
  ],
  providers: [
      FunctionsService,
      UserService,
      PortalService,
      BroadcastService,
      FunctionMonitorService,
      ArmService,
      MonitoringService,
      TelemetryService,
      UtilitiesService,
      BackgroundTasksService,
      GlobalStateService,
      AiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
