import { ContainerSettingsComponent } from './container-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ContainerSettingsManager } from './container-settings-manager';

@NgModule({
    imports: [TranslateModule.forChild(), SharedModule],
    entryComponents: [
        ContainerSettingsComponent
    ],
    declarations: [
        ContainerSettingsComponent
    ],
    providers: [
        ContainerSettingsManager
    ],
    exports: [
        ContainerSettingsComponent
    ]
})
export class ContainerSettingsModule { }
