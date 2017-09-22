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
                path: 'subscriptions/:subscriptionId/resourceGroups/:resourceGroup/providers/Microsoft.Web/sites/:site/settings',
                loadChildren: 'app/ibiza-feature/app-settings-shell/app-settings-shell.module#AppSettingsShellModule'
            },
            {
                path: 'subscriptions/:subscriptionId/resourceGroups/:resourceGroup/providers/Microsoft.Web/sites/:site/slots/:slot/settings',
                loadChildren: 'app/ibiza-feature/app-settings-shell/app-settings-shell.module#AppSettingsShellModule'
            }
        ]
    }
]);

@NgModule({
    imports: [TranslateModule.forChild(), SharedModule, routing],
    declarations: [
        IbizaFeatureComponent,
        EmptyDashboardComponent
    ]
})
export class IbizaFeatureModule {}
