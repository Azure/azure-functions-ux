import { NgModule, ModuleWithProviders } from '@angular/core';
import { AppSettingsShellComponent } from './app-settings-shell.component';
import { RouterModule } from '@angular/router';
import { SiteTabComponent } from 'app/site/site-dashboard/site-tab/site-tab.component';
import { SiteConfigComponent } from 'app/site/site-config/site-config.component';
import { SiteConfigStandaloneComponent } from 'app/site/site-config-standalone/site-config-standalone.component';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { GeneralSettingsComponent } from 'app/site/site-config/general-settings/general-settings.component';
import { AppSettingsComponent } from 'app/site/site-config/app-settings/app-settings.component';
import { ConnectionStringsComponent } from 'app/site/site-config/connection-strings/connection-strings.component';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: AppSettingsShellComponent }]);

@NgModule({
    entryComponents: [SiteConfigComponent],
    imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, routing],
    declarations: [
        SiteConfigComponent,
        SiteConfigStandaloneComponent,
        SiteTabComponent,
        GeneralSettingsComponent,
        AppSettingsComponent,
        ConnectionStringsComponent,
        AppSettingsShellComponent
    ],
    providers: []
})
export class AppSettingsShellModule {}
