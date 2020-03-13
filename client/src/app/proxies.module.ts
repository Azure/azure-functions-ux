import { ApiDetailsComponent } from './api/api-details/api-details.component';
import { ApiNewComponent } from './api/api-new/api-new.component';
import { ProxiesListComponent } from './proxies-list/proxies-list.component';
import { SharedFunctionsModule } from './shared/shared-functions.module';
import { SharedModule } from './shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { NgModule, ModuleWithProviders } from '@angular/core';

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: ProxiesListComponent,
    pathMatch: 'full',
  },
  {
    path: 'new/proxy',
    component: ApiNewComponent,
  },
  {
    path: ':proxyName',
    component: ApiDetailsComponent,
  },
]);

@NgModule({
  imports: [TranslateModule.forChild(), SharedModule, SharedFunctionsModule, routing],
  declarations: [ProxiesListComponent],
  providers: [],
})
export class ProxiesModule {}
