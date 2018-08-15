import { ContainerSettingsComponent } from './container-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ContainerSettingsManager } from './container-settings-manager';
import { ContainerConfigureComponent } from './container-configure/container-configure.component';

@NgModule({
    imports: [
        TranslateModule.forChild(),
        SharedModule
    ],
    entryComponents: [
        ContainerSettingsComponent
    ],
    declarations: [
        ContainerSettingsComponent,
        ContainerConfigureComponent
    ],
    providers: [
        ContainerSettingsManager
    ],
    exports: [
        ContainerSettingsComponent
    ]
})
export class ContainerSettingsModule { }
