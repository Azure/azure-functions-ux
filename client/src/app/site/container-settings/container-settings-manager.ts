import { Injectable, Injector } from '@angular/core';
import { SingleContainer, KubernetesContainer, DockerComposeContainer, Container, ContainerSettingsInput, ContainerSettingsData, ImageSourceType, DockerHubAccessType, ContainerSample } from './container-settings';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { SelectOption } from '../../shared/models/select-option';

@Injectable()
export class ContainerSettingsManager {
    selectedContainer$: Subject<Container> = new Subject<Container>();
    selectedImageSource$: Subject<SelectOption<ImageSourceType>> = new Subject<SelectOption<ImageSourceType>>();
    selectedDockerAccessType$: Subject<DockerHubAccessType> = new Subject<DockerHubAccessType>();
    selectedQuickstartSample$: Subject<ContainerSample> = new Subject<ContainerSample>();
    selectedAcrRegistry$: Subject<string> = new Subject<string>();
    selectedAcrRepo$: Subject<string> = new Subject<string>();
    selectedAcrTag$: Subject<string> = new Subject<string>();

    containers: Container[] = [];
    containerImageSourceOptions: SelectOption<ImageSourceType>[] = [];
    dockerHubAccessOptions: SelectOption<DockerHubAccessType>[] = [];

    constructor(
        private _injector: Injector,
        private _ts: TranslateService) {
    }

    resetSettings(inputs: ContainerSettingsInput<ContainerSettingsData>) {
        this._resetContainers(inputs);
        this._resetImageSourceOptions(inputs);
        this._resetDockerHubAccessOptions(inputs);
    }

    initialize(inputs: ContainerSettingsInput<ContainerSettingsData>) {
        this.selectedContainer$.next(this.containers[0]);
        this.selectedImageSource$.next(this.containerImageSourceOptions[0]);
        this.selectedDockerAccessType$.next(this.dockerHubAccessOptions[0].value);
    }

    private _resetContainers(inputs: ContainerSettingsInput<ContainerSettingsData>) {
        this.containers = [
            new SingleContainer(this._injector),
            new DockerComposeContainer(this._injector),
            new KubernetesContainer(this._injector)
        ];
    }

    private _resetImageSourceOptions(inputs: ContainerSettingsInput<ContainerSettingsData>) {
        this.containerImageSourceOptions = [{
            displayLabel: this._ts.instant(PortalResources.containerQuickStart),
            value: 'quickstart',
        }, {
            displayLabel: this._ts.instant(PortalResources.containerACR),
            value: 'azureContainerRegistry',
        }, {
            displayLabel: this._ts.instant(PortalResources.containerDockerHub),
            value: 'dockerHub',
        }, {
            displayLabel: this._ts.instant(PortalResources.containerPrivateRegistry),
            value: 'privateRegistry',
        }];
    }

    private _resetDockerHubAccessOptions(inputs: ContainerSettingsInput<ContainerSettingsData>) {
        this.dockerHubAccessOptions = [{
            displayLabel: this._ts.instant(PortalResources.containerRepositoryPublic),
            value: 'public',
        }, {
            displayLabel: this._ts.instant(PortalResources.containerRepositoryPrivate),
            value: 'private',
        }];
    }
}
