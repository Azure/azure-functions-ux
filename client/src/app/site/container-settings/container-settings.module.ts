import { ContainerSettingsComponent } from './container-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    imports: [TranslateModule.forChild(), SharedModule],
    entryComponents: [
        ContainerSettingsComponent
    ],
    declarations: [
        ContainerSettingsComponent,
    ],
    providers: [
    ],
    exports: [
        ContainerSettingsComponent
    ]
})
export class ContainerSettingsModule { }
