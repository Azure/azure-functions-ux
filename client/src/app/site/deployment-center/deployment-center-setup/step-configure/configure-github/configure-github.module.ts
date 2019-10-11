import { ConfigureGithubComponent } from './configure-github.component';
import { LinuxFrameworksComponent } from './linux-frameworks/linux-frameworks.component';
import { WindowsFrameworksComponent } from './windows-frameworks/windows-frameworks.component';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { WizardModule } from 'app/controls/form-wizard/wizard.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { SidebarModule } from 'ng-sidebar';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from 'ngx-datatable-accessable';

@NgModule({
  entryComponents: [ConfigureGithubComponent],
  declarations: [ConfigureGithubComponent, LinuxFrameworksComponent, WindowsFrameworksComponent],
  imports: [TranslateModule.forChild(), SharedModule, WizardModule, SidebarModule, NgSelectModule, NgxDatatableModule],
  exports: [ConfigureGithubComponent],
})
export class ConfigureGithubModule {
  static forRoot(): ModuleWithProviders {
    return { ngModule: ConfigureGithubModule, providers: [] };
  }
}
