import { ContainerSettingsComponent } from './container-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ContainerSettingsManager } from './container-settings-manager';
import { ContainerConfigureComponent } from './container-configure/container-configure.component';
import { ContainerHostComponent } from './container-host/container-host.component';
import { ContainerImageSourceComponent } from './container-image-source/container-image-source.component';
import { ContainerImageSourceQuickstartComponent } from './container-image-source/container-image-source-quickstart/container-image-source-quickstart.component';
import { ContainerImageSourceACRComponent } from './container-image-source/container-image-source-acr/container-image-source-acr.component';
import { ContainerImageSourceDockerHubComponent } from './container-image-source/container-image-source-dockerhub/container-image-source-dockerhub.component';
import { ContainerImageSourcePrivateRegistryComponent } from './container-image-source/container-image-source-privateregistry/container-image-source-privateregistry.component';

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
        ContainerConfigureComponent,
        ContainerHostComponent,
        ContainerImageSourceComponent,
        ContainerImageSourceQuickstartComponent,
        ContainerImageSourceACRComponent,
        ContainerImageSourceDockerHubComponent,
        ContainerImageSourcePrivateRegistryComponent,
    ],
    providers: [
        ContainerSettingsManager
    ],
    exports: [
        ContainerSettingsComponent
    ]
})
export class ContainerSettingsModule { }
