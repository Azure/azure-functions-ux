import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ApiNewComponent } from '../../api/api-new/api-new.component';
import { CreateNewProxyShellComponent } from './create-new-proxy-shell.component';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: CreateNewProxyShellComponent }]);

@NgModule({
  entryComponents: [ApiNewComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, routing],
  declarations: [CreateNewProxyShellComponent],
  providers: [],
})
export class CreateNewProxyShellModule {}
