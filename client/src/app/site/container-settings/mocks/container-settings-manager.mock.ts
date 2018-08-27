import { Subject } from 'rxjs/Subject';
import { TestBed } from '@angular/core/testing';
import { Injector, Injectable } from '@angular/core';
import {
    Container,
    SingleContainer,
    DockerComposeContainer,
    KubernetesContainer,
    ContainerSettingsInput,
    ContainerSettingsData
} from '../container-settings';

@Injectable()
export class MockContainerSettingsManager {
    $selectedContainer: Subject<Container> = new Subject<Container>();
    containers: Container[] = [];

    resetContainers() {
        this.containers = [
            new SingleContainer(TestBed.get(Injector)),
            new DockerComposeContainer(TestBed.get(Injector)),
            new KubernetesContainer(TestBed.get(Injector))
        ];
    }

    initialize(inputs: ContainerSettingsInput<ContainerSettingsData>) {
        this.$selectedContainer.next(this.containers[0]);
    }
}
