import { Component, Input } from '@angular/core';
import { ContainerConfigureData, Container, ImageSourceType } from '../container-settings';
import { ContainerSettingsManager } from '../container-settings-manager';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'container-image-source',
    templateUrl: './container-image-source.component.html',
    styleUrls: ['./../container-settings.component.scss', './container-image-source.component.scss'],
})
export class ContainerImageSourceComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.containerConfigureInfo = containerConfigureInfo;
        this._setContainerForm(containerConfigureInfo.container);
        this._setImageSourceType();
    }

    public selectedContainer: Container;
    public selectedImageSource: ImageSourceType;
    public containerConfigureInfo: ContainerConfigureData;
    public containerForm: FormGroup;

    constructor(public containerSettingsManager: ContainerSettingsManager) {

        this.containerSettingsManager.form.controls.containerType.valueChanges.subscribe(value => {
            this._setContainerForm(this.containerSettingsManager.containers.find(c => c.id === value));
            this._setImageSourceType();
        });
    }

    public updateContainerImageSource(imageSource: ImageSourceType) {
        this.selectedImageSource  = imageSource;
        this.containerForm.controls.imageSource.setValue(imageSource);
    }

    private _setContainerForm(container: Container) {
        this.selectedContainer = container;
        this.containerForm = this.containerSettingsManager.getContainerForm(this.selectedContainer.id);
    }

    private _setImageSourceType() {
        const imageSource = this.containerForm.controls.imageSource.value;

        this.selectedImageSource = this.containerSettingsManager.containerImageSourceOptions
            .find(option => option.value === imageSource)
            .value;
    }
}
