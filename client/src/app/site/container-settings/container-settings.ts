import { ResourceId } from '../../shared/models/arm/arm-obj';
import { ContainerSettingsComponent } from './container-settings.component';
import { TranslateService } from '@ngx-translate/core';
import { Injector } from '@angular/core';
import { PortalResources } from '../../shared/models/portal-resources';

export enum ContainerType {
    Single,
    DockerCompose,
    Kubernetes
}

export interface ContainerSettingsInput<T> {
    id: ResourceId;
    data?: T;
    containerSettings: ContainerSettingsComponent;
}

export interface ContainerSettingsData {
    subscriptionId: string;
    location: string;
}

export interface ContainerConfigureInfo {
    containerSettingsData: ContainerSettingsData;
}

export abstract class Container {
    abstract iconUrl: string;
    abstract title: string;
    abstract id: ContainerType;
    abstract description: string;
    abstract detailedDescription: string;

    protected ts: TranslateService;

    constructor(protected injector: Injector) {
        this.ts = injector.get(TranslateService);
    }
}

export class SingleContainer extends Container {
    iconUrl = 'image/singlecontainer.svg';
    title = this.ts.instant(PortalResources.singleContainerTitle);
    id = ContainerType.Single;
    description = this.ts.instant(PortalResources.singleContainerDescription);
    detailedDescription = this.ts.instant(PortalResources.singleContainerDetailedDescription);
}

export class DockerComposeContainer extends Container {
    iconUrl = 'image/dockercompose.svg';
    title = this.ts.instant(PortalResources.dockerComposeContainerTitle);
    id = ContainerType.DockerCompose;
    description = this.ts.instant(PortalResources.dockerComposeContainerDescription);
    detailedDescription = this.ts.instant(PortalResources.dockerComposeContainerDetailedDescription);
}

export class KubernetesContainer extends Container {
    iconUrl = 'image/kubernetes.svg';
    title = this.ts.instant(PortalResources.kubernetesContainerTitle);
    id = ContainerType.Kubernetes;
    description = this.ts.instant(PortalResources.kubernetesContainerDescription);
    detailedDescription = this.ts.instant(PortalResources.kubernetesContainerDetailedDescription);
}