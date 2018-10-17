import { TryLandingComponent } from './try-landing.component';
import { SharedModule } from './../shared/shared.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, ModuleWithProviders } from '@angular/core';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: TryLandingComponent }]);

@NgModule({
  imports: [TranslateModule.forChild(), SharedModule, routing],
  declarations: [TryLandingComponent],
  providers: [],
})
export class TryLandingModule {}
