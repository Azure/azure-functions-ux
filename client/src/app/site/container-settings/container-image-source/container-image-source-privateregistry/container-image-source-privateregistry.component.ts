import { Component, Input } from '@angular/core';
import { ContainerConfigureData, Container, ContainerType } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'container-image-source-privateregistry',
    templateUrl: './container-image-source-privateregistry.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './../container-image-source.component.scss',
        './container-image-source-privateregistry.component.scss',
    ],
})
export class ContainerImageSourcePrivateRegistryComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfoInput: ContainerConfigureData) {
        this.containerConfigureInfo = containerConfigureInfoInput;
        this._setSelectedContainer(containerConfigureInfoInput.container);
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;
    public form: FormGroup;

    constructor(private _containerSettingsManager: ContainerSettingsManager) {

        this._containerSettingsManager.form.controls.containerType.valueChanges.subscribe((containerType: ContainerType) => {
            this._setSelectedContainer(this._containerSettingsManager.containers.find(c => c.id === containerType));
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

    private _setSelectedContainer(container: Container) {
        this.selectedContainer = container;
        this.containerConfigureInfo.container = container;

        this.form = this._containerSettingsManager.getImageSourceForm(container.id, 'privateRegistry');
    }
}
