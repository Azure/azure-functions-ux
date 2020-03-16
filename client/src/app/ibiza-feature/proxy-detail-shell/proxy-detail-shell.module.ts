import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedFunctionsModule } from 'app/shared/shared-functions.module';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ProxyDetailShellComponent } from './proxy-detail-shell.component';
import { ApiDetailsComponent } from '../../api/api-details/api-details.component';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: ProxyDetailShellComponent }]);

@NgModule({
  entryComponents: [ApiDetailsComponent],
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, routing],
  declarations: [ProxyDetailShellComponent],
  providers: [],
})
export class ProxyDetailShellModule {}
