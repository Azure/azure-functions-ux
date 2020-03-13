import { BottomTabComponent } from './../controls/bottom-tabs/bottom-tab.component';
import { BottomTabsComponent } from './../controls/bottom-tabs/bottom-tabs.component';
import { RightTabsComponent } from 'app/controls/right-tabs/right-tabs.component';
import { SharedModule } from './shared.module';
import { MonacoEditorDirective } from './directives/monaco-editor.directive';
import { FnWriteAccessDirective } from './directives/fn-write-access.directive';
import { EditModeWarningComponent } from './../edit-mode-warning/edit-mode-warning.component';
import { PairListComponent } from './../controls/pair-list/pair-list.component';
import { FunctionKeysComponent } from './../function-keys/function-keys.component';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TextEditorComponent } from 'app/controls/text-editor/text-editor.component';
import { AggregateBlockComponent } from 'app/aggregate-block/aggregate-block.component';
import { AggregateBlockPipe } from 'app/aggregate-block/aggregate-block.pipe';
import { SidebarModule } from 'ng-sidebar';
import { FileUploadModule } from 'ng2-file-upload';
import { PopoverModule } from 'ng2-popover';
import { FunctionMonitorComponent } from 'app/function-monitor/function-monitor.component';
import { MonitorClassicComponent } from 'app/function-monitor/monitor-classic/monitor-classic.component';
import { MonitorApplicationInsightsComponent } from 'app/function-monitor/monitor-applicationinsights/monitor-applicationinsights.component';
import { MonitorDetailsComponent } from 'app/function-monitor/monitor-details/monitor-details.component';
import { MonitorConfigureComponent } from 'app/function-monitor/monitor-configure/monitor-configure.component';
import { TableFunctionMonitorComponent } from 'app/table-function-monitor/table-function-monitor.component';
import { TableFunctionMonitorPipe } from 'app/table-function-monitor/table-function-monitor.pipe';
import { ApiNewComponent } from '../api/api-new/api-new.component';
import { RequestResposeOverrideComponent } from '../api/request-respose-override/request-respose-override.component';
import { ApiDetailsComponent } from '../api/api-details/api-details.component';

@NgModule({
  declarations: [
    FunctionKeysComponent,
    PairListComponent,
    EditModeWarningComponent,
    FnWriteAccessDirective,
    MonacoEditorDirective,
    RightTabsComponent,
    BottomTabsComponent,
    BottomTabComponent,
    TextEditorComponent,
    AggregateBlockComponent,
    AggregateBlockPipe,
    FunctionMonitorComponent,
    MonitorClassicComponent,
    MonitorApplicationInsightsComponent,
    MonitorDetailsComponent,
    MonitorConfigureComponent,
    TableFunctionMonitorComponent,
    TableFunctionMonitorPipe,
    ApiNewComponent,
    RequestResposeOverrideComponent,
    ApiDetailsComponent,
  ],
  exports: [
    FunctionKeysComponent,
    PairListComponent,
    EditModeWarningComponent,
    FnWriteAccessDirective,
    MonacoEditorDirective,
    RightTabsComponent,
    BottomTabsComponent,
    BottomTabComponent,
    TextEditorComponent,
    AggregateBlockComponent,
    AggregateBlockPipe,
    FunctionMonitorComponent,
    MonitorClassicComponent,
    MonitorApplicationInsightsComponent,
    MonitorDetailsComponent,
    MonitorConfigureComponent,
    TableFunctionMonitorComponent,
    TableFunctionMonitorPipe,
    ApiNewComponent,
    RequestResposeOverrideComponent,
    ApiDetailsComponent,
  ],
  imports: [TranslateModule.forChild(), SharedModule, SidebarModule, FileUploadModule, PopoverModule],
})
export class SharedFunctionsModule {}
