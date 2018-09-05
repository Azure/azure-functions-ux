import { Component, Input } from '@angular/core';
import { ContainerConfigureData, Container } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';

@Component({
    selector: 'container-image-source-privateregistry',
    templateUrl: './container-image-source-privateregistry.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './../container-image-source.component.scss',
        './container-image-source-privateregistry.component.scss']
})
export class ContainerImageSourcePrivateRegistryComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfoInput: ContainerConfigureData) {
        this.containerConfigureInfo = containerConfigureInfoInput;
        this.selectedContainer = containerConfigureInfoInput.container;
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;

    constructor(private _containerSettingsManager: ContainerSettingsManager) {

        this._containerSettingsManager.selectedContainer$.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
            this.containerConfigureInfo.container = selectedContainer;
        });
    }
}
