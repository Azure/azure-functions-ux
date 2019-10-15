import { ConfigureVstsBuildComponent } from './configure-vsts-build.component';
import { LinuxFramworksComponent } from './linux-frameworks/linux-frameworks.component';
import { WindowsFramworksComponent } from './windows-frameworks/windows-frameworks.component';
import { FunctionsFramworksComponent } from './functions-frameworks/functions-frameworks.component';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { WizardModule } from 'app/controls/form-wizard/wizard.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { SidebarModule } from 'ng-sidebar';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from 'ngx-datatable-accessable';

@NgModule({
  entryComponents: [ConfigureVstsBuildComponent],
  declarations: [ConfigureVstsBuildComponent, LinuxFramworksComponent, WindowsFramworksComponent, FunctionsFramworksComponent],
  imports: [TranslateModule.forChild(), SharedModule, WizardModule, SidebarModule, NgSelectModule, NgxDatatableModule],
  exports: [ConfigureVstsBuildComponent],
})
export class ConfigureVstsBuildModule {
  static forRoot(): ModuleWithProviders {
    return { ngModule: ConfigureVstsBuildModule, providers: [] };
  }
}
