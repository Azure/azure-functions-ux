import { SidebarModule } from 'ng-sidebar';
import { AadRegistrationComponent } from './aad-registration/aad-registration.component';
import { RunHttpComponent } from './run-http/run-http.component';
import { TableFunctionMonitorPipe } from './table-function-monitor/table-function-monitor.pipe';
import { TableFunctionMonitorComponent } from './table-function-monitor/table-function-monitor.component';
import { AggregateBlockPipe } from './aggregate-block/aggregate-block.pipe';
import { AggregateBlockComponent } from './aggregate-block/aggregate-block.component';
import { FunctionMonitorComponent } from './function-monitor/function-monitor.component';
import { BindingEventGridComponent } from './binding-event-grid/binding-event-grid.component';
import { AppSettingComponent } from './pickers/app-setting/app-setting.component';
import { StorageComponent } from './pickers/storage/storage.component';
import { SqlComponent } from './pickers/sql/sql.component';
import { ServiceBusComponent } from './pickers/service-bus/service-bus.component';
import { NotificationHubComponent } from './pickers/notification-hub/notification-hub.component';
import { EventHubComponent } from './pickers/event-hub/event-hub.component';
import { SecretsBoxContainerComponent } from './secrets-box-container/secrets-box-container.component';
import { BindingInputComponent } from './binding-input/binding-input.component';
import { BindingComponent } from './binding/binding.component';
import { TemplatePickerComponent } from './template-picker/template-picker.component';
import { FunctionQuickstartComponent } from './function-quickstart/function-quickstart.component';
import { CreateFunctionWrapperComponent } from './create-function-wrapper/create-function-wrapper.component';
import { FunctionManageComponent } from './function-manage/function-manage.component';
import { FunctionIntegrateV2Component } from './function-integrate-v2/function-integrate-v2.component';
import { FunctionIntegrateComponent } from './function-integrate/function-integrate.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { LogStreamingComponent } from './log-streaming/log-streaming.component';
import { FunctionDevComponent } from './function-dev/function-dev.component';
import { FunctionEditComponent } from './function-edit/function-edit.component';
import { FunctionsListComponent } from './functions-list/functions-list.component';
import { PopoverModule } from 'ng2-popover';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from './shared/shared.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { SecretsBoxInputDirective } from 'app/secrets-box-container/secrets-box-input.directive';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { FunctionNewComponent } from 'app/function/function-new/function-new.component';
import { ExtensionInstallComponent } from './extension-install/extension-install.component';
import { JavaSplashPageComponent } from './java-splash-page/java-splash-page.component';
import { FunctionNewDetailComponent } from './function/function-new-detail/function-new-detail.component';
import { BindingV2Component } from './function/binding-v2/binding-v2.component';
import { BindingInputV2Component } from './function/binding-input-v2/binding-input-v2.component';
import { SidebarPickerComponent } from './function/sidebar-picker/sidebar-picker.component';
import { ExtensionInstallDetailComponent } from './function/extension-install-detail/extension-install-detail.component';

const routing: ModuleWithProviders = RouterModule.forChild([
    {
        path: '',
        component: FunctionsListComponent,
        pathMatch: 'full',
    },
    {
        path: 'new/function',
        component: CreateFunctionWrapperComponent
    },
    {
        path: ':functionName',
        component: FunctionEditComponent,
    },
    {
        path: ':functionName/integrate',
        component: FunctionEditComponent
    },
    {
        path: ':functionName/manage',
        component: FunctionEditComponent
    },
    {
        path: ':functionName/monitor',
        component: FunctionEditComponent
    }

]);

@NgModule({
    imports: [
        TranslateModule.forChild(),
        SharedModule,
        SharedFunctionsModule,
        routing,
        FileUploadModule,
        PopoverModule,
        SidebarModule
    ],
    declarations: [
        FunctionsListComponent,
        FunctionEditComponent,
        FunctionDevComponent,
        LogStreamingComponent,
        FileExplorerComponent,
        FunctionIntegrateComponent,
        FunctionIntegrateV2Component,
        FunctionManageComponent,
        CreateFunctionWrapperComponent,
        FunctionNewComponent,
        ExtensionInstallComponent,
        FunctionQuickstartComponent,
        TemplatePickerComponent,
        BindingComponent,
        BindingInputComponent,
        SecretsBoxContainerComponent,
        SecretsBoxInputDirective,
        EventHubComponent,
        ServiceBusComponent,
        NotificationHubComponent,
        AppSettingComponent,
        StorageComponent,
        SqlComponent,
        BindingEventGridComponent,
        FunctionMonitorComponent,
        AggregateBlockComponent,
        AggregateBlockPipe,
        TableFunctionMonitorComponent,
        TableFunctionMonitorPipe,
        RunHttpComponent,
        AadRegistrationComponent,
        FunctionNewDetailComponent,
        BindingV2Component,
        BindingInputV2Component,
        JavaSplashPageComponent,
        SidebarPickerComponent,
        ExtensionInstallDetailComponent
    ],
    providers: []
})
export class FunctionsModule { }
