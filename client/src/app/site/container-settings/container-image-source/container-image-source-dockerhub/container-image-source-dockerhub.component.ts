import { Component, Input } from '@angular/core';
import { ContainerConfigureData, Container, DockerHubAccessType, ContainerType } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'container-image-source-dockerhub',
    templateUrl: './container-image-source-dockerhub.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './../container-image-source.component.scss',
        './container-image-source-dockerhub.component.scss',
    ],
})
export class ContainerImageSourceDockerHubComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.containerConfigureInfo = containerConfigureInfo;
        this._setSelectedContainer(containerConfigureInfo.container);
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;
    public selectedAccessType: DockerHubAccessType;
    public form: FormGroup;

    private _imageSourceForm: FormGroup;

    constructor(public containerSettingsManager: ContainerSettingsManager) {

        this.containerSettingsManager.form.controls.containerType.valueChanges.subscribe((containerType: ContainerType) => {
            this._setSelectedContainer(this.containerSettingsManager.containers.find(c => c.id === containerType));
        });
    }

    public extractConfig(event) {
        const input = event.target;
        const reader = new FileReader();
        reader.onload = () => {
            this.form.controls.config.setValue(reader.result);
        };
        reader.readAsText(input.files[0]);
    }

    public updateAccessOptions(accessType: DockerHubAccessType) {
        this.selectedAccessType = accessType;
        this._imageSourceForm.controls.accessType.setValue(accessType);
        this.form = this.containerSettingsManager.getDockerHubForm(
            this.selectedContainer.id,
            'dockerHub',
            accessType);
    }

    private _setSelectedContainer(container: Container) {
        this.selectedContainer = container;
        this.containerConfigureInfo.container = container;

        this._imageSourceForm = this.containerSettingsManager.getImageSourceForm(container.id, 'dockerHub');
        this.form = this.containerSettingsManager.getDockerHubForm(
            container.id,
            'dockerHub',
            this._imageSourceForm.controls.accessType.value);

        this.selectedAccessType = this._imageSourceForm.controls.accessType.value;
    }
}
