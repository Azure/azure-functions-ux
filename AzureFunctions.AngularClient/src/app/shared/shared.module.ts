import { FunctionAppService } from 'app/shared/services/function-app.service';
import { IsDirtyDirective } from './directives/is-dirty.directive';
import { LoadImageDirective } from './../controls/load-image/load-image.directive';
import { SlideToggleComponent } from './../controls/slide-toggle/slide-toggle.component';
import { TryNowBusyStateComponent } from './../try-now-busy-state/try-now-busy-state.component';
import { TooltipDirective } from './../tooltip-content/tooltip.directive';
import { TooltipContentComponent } from './../tooltip-content/tooltip-content.component';
import { TryNowComponent } from './../try-now/try-now.component';
import { TopBarStandAloneLoginUserComponent } from './../top-bar-standalone-loginuser/top-bar-standalone-loginuser.component';
import { GlobalErrorHandler } from './GlobalErrorHandler';
import { GlobalStateService } from './services/global-state.service';
import { BackgroundTasksService } from './services/background-tasks.service';
import { UtilitiesService } from './services/utilities.service';
import { LocalStorageService } from './services/local-storage.service';
import { AuthzService } from './services/authz.service';
import { SlotsService } from './services/slots.service';
import { ScenarioService } from './services/scenario/scenario.service';
import { CacheService } from 'app/shared/services/cache.service';
import { LogService } from './services/log.service';
import { FunctionMonitorService } from './services/function-monitor.service';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { PortalService } from './services/portal.service';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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


export function ArmServiceFactory(
    http: Http,
    userService: UserService,
    aiService: AiService) {
    const service = Url.getParameterByName(null, 'trial') === 'true' ?
        new ArmTryService(http, userService, aiService) :
        new ArmService(http, userService, aiService);

    return service;
}

export function AiServiceFactory() {
    const service = Url.getParameterByName(null, 'trial') === 'true' ? new AiTryService() : new AiService();
    return service;
}

@NgModule({
    declarations: [
        TopBarComponent,
        TryNowComponent,
        TopBarStandAloneLoginUserComponent,
        TryNowBusyStateComponent,
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
        ActivateWithKeysDirective
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MultiDropDownComponent,
        TopBarComponent,
        TryNowComponent,
        TopBarStandAloneLoginUserComponent,
        TryNowBusyStateComponent,
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
        ActivateWithKeysDirective
    ],
    imports: [
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        TranslateModule.forChild(),
    ]
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
                LogService,
                {
                    provide: ArmService, useFactory: ArmServiceFactory, deps: [
                        Http,
                        UserService,
                        AiService
                    ]
                },
                CacheService,
                ScenarioService,
                SlotsService,
                AuthzService,
                LocalStorageService,
                UtilitiesService,
                BackgroundTasksService,
                GlobalStateService,
                { provide: AiService, useFactory: AiServiceFactory },
                { provide: ErrorHandler, useClass: GlobalErrorHandler }
            ]
        };
    }
}
