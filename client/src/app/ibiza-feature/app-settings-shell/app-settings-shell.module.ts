import { NgModule, ModuleWithProviders } from '@angular/core';
import { AppSettingsShellComponent } from './app-settings-shell.component';
import { RouterModule } from '@angular/router';
import { SiteConfigComponent } from 'app/site/site-config/site-config.component';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { SiteConfigModule } from 'app/site/site-config/site-config.module';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: AppSettingsShellComponent }]);

@NgModule({
  entryComponents: [SiteConfigComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, SiteConfigModule, routing],
  declarations: [],
  providers: [],
})
export class AppSettingsShellModule {}
