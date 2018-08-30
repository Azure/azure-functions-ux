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
import { NgSelectModule } from '@ng-select/ng-select';
import { ContainerSamplesService } from '../../shared/services/container-samples.service';
import { ContainerLogsComponent } from './container-image-source/container-logs/container-logs.component';
import { ContainerMultiConfigComponent } from './container-image-source/container-multiconfig/container-multiconfig.component';
import { ContainerContinuousDeliveryComponent } from './container-image-source/container-continuous-delivery/container-continuos-delivery.component';

@NgModule({
    imports: [
        TranslateModule.forChild(),
        SharedModule,
        NgSelectModule,
    ],
    entryComponents: [
        ContainerSettingsComponent,
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
        ContainerLogsComponent,
        ContainerMultiConfigComponent,
        ContainerContinuousDeliveryComponent,
    ],
    providers: [
        ContainerSettingsManager,
        ContainerSamplesService,
    ],
    exports: [
        ContainerSettingsComponent,
    ],
})
export class ContainerSettingsModule { }
