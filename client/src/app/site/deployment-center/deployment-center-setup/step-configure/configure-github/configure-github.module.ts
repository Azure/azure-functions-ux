import { ConfigureGithubComponent } from './configure-github.component';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { WizardModule } from 'app/controls/form-wizard/wizard.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { SidebarModule } from 'ng-sidebar';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from 'ngx-datatable-accessable';
import { StackSelectorComponent } from './stack-selector/stack-selector.component';

@NgModule({
  entryComponents: [ConfigureGithubComponent],
  declarations: [ConfigureGithubComponent, StackSelectorComponent],
  imports: [TranslateModule.forChild(), SharedModule, WizardModule, SidebarModule, NgSelectModule, NgxDatatableModule],
  exports: [ConfigureGithubComponent],
})
export class ConfigureGithubModule {
  static forRoot(): ModuleWithProviders {
    return { ngModule: ConfigureGithubModule, providers: [] };
  }
}
