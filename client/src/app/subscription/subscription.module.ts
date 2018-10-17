import { CreateSubscriptionComponent } from './../subscription/create-subscription/create-subscription.component';
import { SharedModule } from './../shared/shared.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { SubscriptionPlanPickerComponent } from './subscription-plan-picker/subscription-plan-picker.component';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: 'new/subscription', component: CreateSubscriptionComponent }]);

@NgModule({
  imports: [TranslateModule.forChild(), SharedModule, routing],
  declarations: [CreateSubscriptionComponent, SubscriptionPlanPickerComponent],
  providers: [],
})
export class SubscriptionComponentModule {}
