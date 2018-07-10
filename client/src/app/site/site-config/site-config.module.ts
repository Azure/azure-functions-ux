import { NgModule } from '@angular/core';
import { SiteConfigComponent } from 'app/site/site-config/site-config.component';
import { SiteConfigStandaloneComponent } from 'app/site/site-config-standalone/site-config-standalone.component';
import { GeneralSettingsComponent } from 'app/site/site-config/general-settings/general-settings.component';
import { AppSettingsComponent } from 'app/site/site-config/app-settings/app-settings.component';
import { ConnectionStringsComponent } from 'app/site/site-config/connection-strings/connection-strings.component';
import { AppSettingsShellComponent } from 'app/ibiza-feature/app-settings-shell/app-settings-shell.component';
import { DefaultDocumentsComponent } from 'app/site/site-config/default-documents/default-documents.component';
import { HandlerMappingsComponent } from 'app/site/site-config/handler-mappings/handler-mappings.component';
import { VirtualDirectoriesComponent } from 'app/site/site-config/virtual-directories/virtual-directories.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';

@NgModule({
  entryComponents: [
    SiteConfigStandaloneComponent
  ],
  imports: [
    TranslateModule.forChild(), SharedModule, SharedFunctionsModule
  ],
  declarations: [
    SiteConfigComponent,
    SiteConfigStandaloneComponent,
    GeneralSettingsComponent,
    AppSettingsComponent,
    ConnectionStringsComponent,
    AppSettingsShellComponent,
    DefaultDocumentsComponent,
    HandlerMappingsComponent,
    VirtualDirectoriesComponent,
  ],
  exports: [
    SiteConfigComponent,
    SiteConfigStandaloneComponent
  ]
})
export class SiteConfigModule { }
