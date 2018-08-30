import { Component, Input } from '@angular/core';
import { Container, ContainerConfigureData } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';

@Component({
    selector: 'container-continuous-delivery',
    templateUrl: './container-continuos-delivery.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './container-continuos-delivery.component.scss',
    ],
})
export class ContainerContinuousDeliveryComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.containerConfigureInfo = containerConfigureInfo;
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;

    constructor(private _containerSettingsManager: ContainerSettingsManager) {

        this._containerSettingsManager.selectedContainer$.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
        });
    }
}
