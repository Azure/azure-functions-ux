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
                component: EmptyDashboardComponent
            },
            {
                path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/settings',
                loadChildren: 'app/ibiza-feature/app-settings-shell/app-settings-shell.module#AppSettingsShellModule'
            },
            {
                path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/settings',
                loadChildren: 'app/ibiza-feature/app-settings-shell/app-settings-shell.module#AppSettingsShellModule'
            },
            {
                path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/deployment',
                loadChildren: 'app/ibiza-feature/deployment-shell/deployment-shell.module#DeploymentShellModule'
            },
            {
                path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/deployment',
                loadChildren: 'app/ibiza-feature/deployment-shell/deployment-shell.module#DeploymentShellModule'
            },
            {
                path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots',
                loadChildren: 'app/ibiza-feature/slots-shell/slots-shell.module#SlotsShellModule'
            },
            {
                path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/slots',
                loadChildren: 'app/ibiza-feature/slots-shell/slots-shell.module#SlotsShellModule'
            },
            {
                path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/swap/:destslot',
                loadChildren: 'app/ibiza-feature/slots-shell/slots-shell.module#SlotsShellModule'
            },
            {
                path: 'subscriptions/:subscriptionId/resourcegroups/:resourceGroup/providers/microsoft.web/sites/:site/slots/:slot/swap/:destslot',
                loadChildren: 'app/ibiza-feature/slots-shell/slots-shell.module#SlotsShellModule'
            }
        ]
    }
]);

@NgModule({
    imports: [TranslateModule.forChild(), SharedModule, routing],
    declarations: [IbizaFeatureComponent]
})
export class IbizaFeatureModule {}
