import { ContainerSettingsModule } from './../container-settings.module';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ContainerSettingsShellComponent } from './container-settings-shell.component';
import { SharedFunctionsModule } from '../../../shared/shared-functions.module';

const routing: ModuleWithProviders = RouterModule.forChild([{ path: '', component: ContainerSettingsShellComponent }]);

@NgModule({
    entryComponents: [],
    imports: [TranslateModule.forChild(),  SharedModule, SharedFunctionsModule, ContainerSettingsModule, routing],
    declarations: [
        ContainerSettingsShellComponent,
    ],
    providers: [],
})
export class ContainerSettingsShellModule { }
