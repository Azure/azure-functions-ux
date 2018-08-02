import { Injectable, Injector } from '@angular/core';
import { SingleContainer, KubernetesContainer, DockerComposeContainer, Container, ContainerSettingsInput, ContainerSettingsData } from "./container-settings";

@Injectable()
export class ContainerSettingsManager {
    selectedContainer: Container;
    containers: Container[] = [];

    constructor(private _injector: Injector) {
    }

    resetContainers() {
        this.containers = [
            new SingleContainer(this._injector),
            new DockerComposeContainer(this._injector),
            new KubernetesContainer(this._injector)
        ];
    }

    initialize(inputs: ContainerSettingsInput<ContainerSettingsData>) {
        this.selectedContainer = this.containers[0];
    }
}
