import { TopWarningComponent } from './../top-warning/top-warning.component';
import { TrialExpiredComponent } from './../trial-expired/trial-expired.component';
import { EmptyDashboardComponent } from './empty-dashboard.component';
import { RouterModule } from '@angular/router';
import { TreeViewComponent } from './../tree-view/tree-view.component';
import { TranslateModule } from '@ngx-translate/core';
import { SideNavComponent } from './../side-nav/side-nav.component';
import { SharedModule } from './../shared/shared.module';
import { MainComponent } from './main.component';
import { NgModule, ModuleWithProviders } from '@angular/core';

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'blank',
        component: EmptyDashboardComponent,
      },
      {
        path: 'apps',
        loadChildren: 'app/apps-list/apps-list.module#AppsListModule',
      },
      {
        path: 'subs',
        loadChildren: 'app/subscription/subscription.module#SubscriptionComponentModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/sites/:site',
        loadChildren: 'app/site/site.module#SiteModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/sites/:site/functions',
        loadChildren: 'app/functions.module#FunctionsModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/sites/:site/proxies',
        loadChildren: 'app/proxies.module#ProxiesModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/sites/:site/slots',
        loadChildren: 'app/slots-list/slots-list.module#SlotsListModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/sites/:site/slots/:slot',
        loadChildren: 'app/site/site.module#SiteModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/sites/:site/slots/:slot/functions',
        loadChildren: 'app/functions.module#FunctionsModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/sites/:site/slots/:slot/proxies',
        loadChildren: 'app/proxies.module#ProxiesModule',
      },
      {
        path: 'providers/microsoft.blueridge',
        loadChildren: 'app/functions.module#FunctionsModule',
      },
      {
        path: '**',
        component: EmptyDashboardComponent,
      },
    ],
  },
]);

@NgModule({
  imports: [TranslateModule.forChild(), SharedModule, routing],
  declarations: [MainComponent, SideNavComponent, TreeViewComponent, TrialExpiredComponent, TopWarningComponent],
  providers: [],
})
export class MainModule {}
