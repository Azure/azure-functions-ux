import { LogicAppsComponent } from './../logic-apps/logic-apps.component';
import { SiteTabComponent } from 'app/site/site-dashboard/site-tab/site-tab.component';
import { SharedFunctionsModule } from './../shared/shared-functions.module';
import { FeatureGroupComponent } from './../feature-group/feature-group.component';
import { DownloadFunctionAppContentComponent } from './../download-function-app-content/download-function-app-content.component';
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
import { DeploymentCenterModule } from 'app/site/deployment-center/deployment-center.module';
import { HostEditorComponent } from './../host-editor/host-editor.component';
import { SiteConfigModule } from 'app/site/site-config/site-config.module';
import { SpecPickerModule } from './spec-picker/spec-picker.module';
import { ProdFunctionInitialUploadComponent } from '../prod-function-initial-upload/prod-function-initial-upload.component';
import { ConsoleModule } from './console/console.module';
import { LogStreamComponent } from './log-stream/log-stream.component';
import { LogContentComponent } from './log-stream/log-content.component';
import { QuickstartModule } from './quickstart/quickstart.module';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: SiteDashboardComponent }]);

@NgModule({
    entryComponents: [
        SiteSummaryComponent,
        SiteManageComponent,
        FunctionRuntimeComponent,
        SwaggerDefinitionComponent,
        SiteConfigComponent,
        LogicAppsComponent,
        LogContentComponent,
        LogStreamComponent
    ],
    imports: [
        TranslateModule.forChild(),
        SharedModule,
        SharedFunctionsModule,
        SiteConfigModule,
        ConsoleModule,
        DeploymentCenterModule,
        SpecPickerModule,
        routing,
        QuickstartModule
    ],
    declarations: [
        SiteDashboardComponent,
        SiteSummaryComponent,
        SiteManageComponent,
        FeatureGroupComponent,
        FunctionRuntimeComponent,
        SwaggerDefinitionComponent,
        SwaggerFrameDirective,
        DownloadFunctionAppContentComponent,
        SiteEnabledFeaturesComponent,
        HostEditorComponent,
        SiteTabComponent,
        LogicAppsComponent,
        ProdFunctionInitialUploadComponent,
        LogContentComponent,
        LogStreamComponent
    ],
    providers: []
})
export class SiteModule { }
