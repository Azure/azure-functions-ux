import { CreateAppComponent } from './../site/create-app/create-app.component';
import { SharedModule } from './../shared/shared.module';
import { AppsListComponent } from './apps-list.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, ModuleWithProviders } from '@angular/core';

const routing: ModuleWithProviders = RouterModule.forChild([
  { path: '', component: AppsListComponent, pathMatch: 'full' },
  { path: 'new/app', component: CreateAppComponent },
]);

@NgModule({
  imports: [TranslateModule.forChild(), SharedModule, routing],
  declarations: [AppsListComponent, CreateAppComponent],
  providers: [],
})
export class AppsListModule {}
