import { Component, Input } from '@angular/core';
import { ContainerConfigureData, Container, DockerHubAccessType } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';

@Component({
    selector: 'container-image-source-dockerhub',
    templateUrl: './container-image-source-dockerhub.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './../container-image-source.component.scss',
        './container-image-source-dockerhub.component.scss']
})
export class ContainerImageSourceDockerHubComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfoInput: ContainerConfigureData) {
        this.containerConfigureInfo = containerConfigureInfoInput;
        this.selectedAccessType = this.selectedAccessType || this.containerSettingsManager.dockerHubAccessOptions[0].value;
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;
    public selectedAccessType: DockerHubAccessType;

    constructor(public containerSettingsManager: ContainerSettingsManager) {

        this.containerSettingsManager.selectedContainer$.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
            this.containerConfigureInfo.container = selectedContainer;
        });

        this.containerSettingsManager.selectedDockerHubAccessType$.subscribe((accessType: DockerHubAccessType) => {
            this.selectedAccessType = accessType;
        });
    }

    public updateAccessOptions(accessType: string) {
        this.containerSettingsManager.selectedDockerHubAccessType$.next(accessType);
    }
}
