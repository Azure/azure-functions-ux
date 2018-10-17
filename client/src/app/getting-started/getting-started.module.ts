import { GettingStartedComponent } from './getting-started.component';
import { SharedModule } from './../shared/shared.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, ModuleWithProviders } from '@angular/core';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: GettingStartedComponent }]);

@NgModule({
  imports: [TranslateModule.forChild(), SharedModule, routing],
  declarations: [GettingStartedComponent],
  providers: [],
})
export class GettingStartedModule {}
