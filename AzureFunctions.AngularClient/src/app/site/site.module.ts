import { SharedFunctionsModule } from './../shared/shared-functions.module';
import { ConnectionStringsComponent } from './site-config/connection-strings/connection-strings.component';
import { AppSettingsComponent } from './site-config/app-settings/app-settings.component';
import { DefaultDocumentsComponent } from './site-config/default-documents/default-documents.component';
import { GeneralSettingsComponent } from './site-config/general-settings/general-settings.component';
import { FeatureGroupComponent } from './../feature-group/feature-group.component';
import { DownloadFunctionAppContentComponent } from './../download-function-app-content/download-function-app-content.component';
import { SiteTabComponent } from './site-dashboard/site-tab/site-tab.component';
import { SiteConfigStandaloneComponent } from './site-config-standalone/site-config-standalone.component';
import { SiteConfigComponent } from './site-config/site-config.component';
import { SwaggerDefinitionComponent } from './swagger-definition/swagger-definition.component';
import { FunctionRuntimeComponent } from './function-runtime/function-runtime.component';
import { SiteManageComponent } from './site-manage/site-manage.component';
import { SwaggerFrameDirective } from './swagger-frame/swagger-frame.directive';
import { SiteSummaryComponent } from './site-summary/site-summary.component';
import { SiteEnabledFeaturesComponent } from './site-enabled-features/site-enabled-features.component';
import { SharedModule } from './../shared/shared.module';
import { SiteDashboardComponent } from './site-dashboard/site-dashboard.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HostEditorComponent } from './../host-editor/host-editor.component';

const routing: ModuleWithProviders = RouterModule.forChild([
    { path: '', component: SiteDashboardComponent }
]);

@NgModule({
    entryComponents: [
        SiteSummaryComponent,
        SiteManageComponent,
        FunctionRuntimeComponent,
        SwaggerDefinitionComponent,
        SiteConfigComponent,
    ],
    imports: [
        TranslateModule.forChild(),
        SharedModule,
        SharedFunctionsModule,
        routing
    ],
    declarations: [
        SiteDashboardComponent,
        SiteSummaryComponent,
        SiteManageComponent,
        FeatureGroupComponent,
        FunctionRuntimeComponent,
        SwaggerDefinitionComponent,
        SwaggerFrameDirective,
        SiteConfigComponent,
        SiteConfigStandaloneComponent,
        SiteTabComponent,
        DownloadFunctionAppContentComponent,
        SiteEnabledFeaturesComponent,
        GeneralSettingsComponent,
        DefaultDocumentsComponent,
        AppSettingsComponent,
        ConnectionStringsComponent,
        HostEditorComponent
    ],
    providers: []
})
export class SiteModule { }
