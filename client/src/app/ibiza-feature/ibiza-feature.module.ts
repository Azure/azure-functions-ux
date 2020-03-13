import { NgModule, ModuleWithProviders } from '@angular/core';
import { IbizaFeatureComponent } from './ibiza-feature.component';
import { EmptyDashboardComponent } from 'app/main/empty-dashboard.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule } from '@angular/router';

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: IbizaFeatureComponent,
    children: [
      {
        path: 'blank',
        component: EmptyDashboardComponent,
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/settings',
        loadChildren: 'app/ibiza-feature/app-settings-shell/app-settings-shell.module#AppSettingsShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/settings',
        loadChildren: 'app/ibiza-feature/app-settings-shell/app-settings-shell.module#AppSettingsShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/functions/:function/monitor',
        loadChildren: 'app/ibiza-feature/function-monitor-shell/function-monitor-shell.module#FunctionMonitorShellModule',
      },
      {
        path:
          'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/functions/:function/monitor',
        loadChildren: 'app/ibiza-feature/function-monitor-shell/function-monitor-shell.module#FunctionMonitorShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/deployment',
        loadChildren: 'app/ibiza-feature/deployment-shell/deployment-shell.module#DeploymentShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/deployment',
        loadChildren: 'app/ibiza-feature/deployment-shell/deployment-shell.module#DeploymentShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/deploymentslots',
        loadChildren: 'app/ibiza-feature/deployment-slots-shell/deployment-slots-shell.module#DeploymentSlotsShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/deploymentslots',
        loadChildren: 'app/ibiza-feature/deployment-slots-shell/deployment-slots-shell.module#DeploymentSlotsShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/swapslots',
        loadChildren: 'app/ibiza-feature/swap-slots-shell/swap-slots-shell.module#SwapSlotsShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/swapslots',
        loadChildren: 'app/ibiza-feature/swap-slots-shell/swap-slots-shell.module#SwapSlotsShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/addslot',
        loadChildren: 'app/ibiza-feature/add-slot-shell/add-slot-shell.module#AddSlotShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/addslot',
        loadChildren: 'app/ibiza-feature/add-slot-shell/add-slot-shell.module#AddSlotShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/logstreaming',
        loadChildren: 'app/site/log-stream/log-stream-shell/log-stream-shell.module#LogStreamShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/logstreaming',
        loadChildren: 'app/site/log-stream/log-stream-shell/log-stream-shell.module#LogStreamShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/serverfarms/:serverfarm/scaleup',
        loadChildren: 'app/site/spec-picker/spec-picker-shell/spec-picker-shell.module#SpecPickerShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/scaleup',
        loadChildren: 'app/site/spec-picker/spec-picker-shell/spec-picker-shell.module#SpecPickerShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/containersettings',
        loadChildren: 'app/site/container-settings/container-settings-shell/container-settings-shell.module#ContainerSettingsShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/containersettings',
        loadChildren: 'app/site/container-settings/container-settings-shell/container-settings-shell.module#ContainerSettingsShellModule',
      },
      {
        path:
          'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/containersettings',
        loadChildren: 'app/site/container-settings/container-settings-shell/container-settings-shell.module#ContainerSettingsShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/byos',
        loadChildren: 'app/site/byos/byos-shell/byos-shell.module#ByosShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/byos',
        loadChildren: 'app/site/byos/byos-shell/byos-shell.module#ByosShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/console',
        loadChildren: 'app/ibiza-feature/console-shell/console-shell.module#ConsoleShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/console',
        loadChildren: 'app/ibiza-feature/console-shell/console-shell.module#ConsoleShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/createnewproxy',
        loadChildren: 'app/ibiza-feature/create-new-proxy-shell/create-new-proxy-shell.module#CreateNewProxyShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/createnewproxy',
        loadChildren: 'app/ibiza-feature/create-new-proxy-shell/create-new-proxy-shell.module#CreateNewProxyShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/proxydetail',
        loadChildren: 'app/ibiza-feature/proxy-detail-shell/proxy-detail-shell.module#ProxyDetailShellModule',
      },
      {
        path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/proxydetail',
        loadChildren: 'app/ibiza-feature/proxy-detail-shell/proxy-detail-shell.module#ProxyDetailShellModule',
      },
    ],
  },
]);

@NgModule({
  imports: [TranslateModule.forChild(), SharedModule, routing],
  declarations: [IbizaFeatureComponent],
})
export class IbizaFeatureModule {}
