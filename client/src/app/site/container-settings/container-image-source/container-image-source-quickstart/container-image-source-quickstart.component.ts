import { Component, Input } from '@angular/core';
import { ContainerConfigureInfo, Container } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';

@Component({
    selector: 'container-image-source-quickstart',
    templateUrl: './container-image-source-quickstart.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './../container-image-source.component.scss',
        './container-image-source-quickstart.component.scss']
})
export class ContainerImageSourceQuickstartComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureInfo) {
        this.containerConfigureInfo = containerConfigureInfo;
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureInfo;

    constructor(private _containerSettingsManager: ContainerSettingsManager) {

        this._containerSettingsManager.$selectedContainer.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
        });
    }
}