import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ApiNewComponent } from '../../api/api-new/api-new.component';
import { NewProxyShellComponent } from './new-proxy-shell.component';
import { RequestResposeOverrideComponent } from '../../api/request-respose-override/request-respose-override.component';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: NewProxyShellComponent }]);

@NgModule({
  entryComponents: [ApiNewComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, routing],
  declarations: [NewProxyShellComponent, ApiNewComponent, RequestResposeOverrideComponent],
  providers: [],
})
export class NewProxyShellModule {}
