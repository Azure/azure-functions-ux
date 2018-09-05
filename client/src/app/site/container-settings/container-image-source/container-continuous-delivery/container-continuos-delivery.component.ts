import { Component, Input } from '@angular/core';
import { Container, ContainerConfigureData, ContinuousDeploymentOption } from '../../container-settings';
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
        this.selectedDeploymentOption = 'off';
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;
    public selectedDeploymentOption: ContinuousDeploymentOption;

    constructor(public containerSettingsManager: ContainerSettingsManager) {

        this.containerSettingsManager.selectedContainer$.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
        });

        this.containerSettingsManager.selectedContinuousDeploymentOption$.subscribe((option: ContinuousDeploymentOption) => {
            this.selectedDeploymentOption = option;
        });
    }

    public updateContainerImageSupdateDeploymentOptionource(option: ContinuousDeploymentOption) {
        this.containerSettingsManager.selectedContinuousDeploymentOption$.next(option);
    }
}
